"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Product = {
  id: string;
  name: string;
  barcode: string;
  stock_level: number;
  warehouse_id: string;
  warehouse_name?: string;
  bin_location: string;
  price: number;
};

export default function BarcodeScannerPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [scanning, setScanning] = useState(false);
  const [action, setAction] = useState<"inbound" | "outbound" | "transfer" | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [targetWarehouse, setTargetWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkUser();
    fetchWarehouses();
    // Auto-focus input
    if (inputRef.current) inputRef.current.focus();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchWarehouses() {
    const { data } = await supabase.from("warehouses").select("id, name, code").eq("is_active", true);
    setWarehouses(data || []);
  }

  async function scanBarcode() {
    if (!barcode.trim()) {
      setMessage("Please enter or scan a barcode");
      return;
    }
    setScanning(true);
    setMessage("");

    const { data, error } = await supabase
      .from("products")
      .select(`*, warehouses(name)`)
      .eq("barcode", barcode.trim())
      .single();

    if (error || !data) {
      setMessage(`Product with barcode "${barcode}" not found`);
      setProduct(null);
      setScanning(false);
      return;
    }

    setProduct({
      ...data,
      warehouse_name: data.warehouses?.name,
    });
    setScanning(false);
    setAction(null);
    setQuantity(1);
    setTargetWarehouse("");
  }

  async function recordTransaction() {
    if (!product) return;
    if (action === "transfer" && !targetWarehouse) {
      setMessage("Select destination warehouse");
      return;
    }

    const newStock = action === "inbound" ? product.stock_level + quantity :
                     action === "outbound" ? product.stock_level - quantity :
                     product.stock_level;

    if (newStock < 0) {
      setMessage("Insufficient stock for outbound");
      return;
    }

    // Update product stock
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock_level: newStock })
      .eq("id", product.id);

    if (stockError) {
      setMessage("Stock update failed: " + stockError.message);
      return;
    }

    // Log transaction
    await supabase.from("warehouse_transactions").insert([{
      product_id: product.id,
      warehouse_id: product.warehouse_id,
      transaction_type: action,
      quantity: quantity,
      reference_number: `SCAN-${Date.now()}`,
      notes: `Scanned barcode: ${barcode}`,
    }]);

    // If transfer, also create transfer record and update warehouse assignment
    if (action === "transfer") {
      await supabase.from("warehouse_transfers").insert([{
        product_id: product.id,
        quantity: quantity,
        from_warehouse_id: product.warehouse_id,
        to_warehouse_id: targetWarehouse,
        status: "completed",
        completed_at: new Date().toISOString(),
      }]);
      // Update product's warehouse
      await supabase.from("products").update({ warehouse_id: targetWarehouse }).eq("id", product.id);
      // Log inbound to destination
      await supabase.from("warehouse_transactions").insert([{
        product_id: product.id,
        warehouse_id: targetWarehouse,
        transaction_type: "transfer_in",
        quantity: quantity,
        reference_number: `TRF-${Date.now()}`,
      }]);
    }

    setMessage(`✅ ${action?.toUpperCase()} recorded: ${quantity} x ${product.name}`);
    setProduct(null);
    setBarcode("");
    setAction(null);
    if (inputRef.current) inputRef.current.focus();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Barcode Scanner</h1>
        <p className="text-gray-600 mb-8">Scan product barcodes to locate, update stock, or transfer.</p>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-1">Scan / Enter Barcode</label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scanBarcode()}
              className="flex-1 border rounded-lg px-4 py-2 text-lg font-mono"
              placeholder="Scan or type barcode..."
              autoFocus
            />
            <button onClick={scanBarcode} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Scan
            </button>
          </div>
          {message && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}
        </div>

        {product && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Product Found</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Barcode</p>
                <p className="font-mono">{product.barcode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="font-bold text-lg">{product.stock_level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Warehouse</p>
                <p>{product.warehouse_name || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bin Location</p>
                <p>{product.bin_location || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p>N${product.price?.toLocaleString() || "0"}</p>
              </div>
            </div>

            {!action ? (
              <div className="flex gap-3">
                <button onClick={() => setAction("inbound")} className="flex-1 bg-green-600 text-white py-2 rounded-lg">📥 Inbound (Receive)</button>
                <button onClick={() => setAction("outbound")} className="flex-1 bg-red-600 text-white py-2 rounded-lg">📤 Outbound (Ship)</button>
                <button onClick={() => setAction("transfer")} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">🔄 Transfer</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="border rounded px-3 py-2 w-32" min="1" />
                </div>
                {action === "transfer" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination Warehouse</label>
                    <select value={targetWarehouse} onChange={(e) => setTargetWarehouse(e.target.value)} className="border rounded px-3 py-2 w-full">
                      <option value="">Select warehouse</option>
                      {warehouses.filter(w => w.id !== product.warehouse_id).map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={recordTransaction} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Confirm {action?.toUpperCase()}</button>
                  <button onClick={() => setAction(null)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}