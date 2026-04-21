"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Transaction = {
  id: string;
  product_id: string;
  product_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  transaction_type: string;
  quantity: number;
  reference_number: string;
  notes: string;
  created_at: string;
};

export default function StockTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    warehouse_id: "",
    transaction_type: "inbound",
    quantity: 1,
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchData() {
    setLoading(true);
    const [transRes, prodRes, whRes] = await Promise.all([
      supabase.from("warehouse_transactions").select("*, products(name), warehouses(name)").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name"),
      supabase.from("warehouses").select("id, name")
    ]);
    if (transRes.error) console.error(transRes.error);
    else {
      const mapped = (transRes.data || []).map((t: any) => ({
        ...t,
        product_name: t.products?.name,
        warehouse_name: t.warehouses?.name,
      }));
      setTransactions(mapped);
    }
    if (prodRes.error) alert("Failed to fetch products: " + prodRes.error.message);
    else setProducts(prodRes.data || []);
    if (whRes.error) alert("Failed to fetch warehouses: " + whRes.error.message);
    else setWarehouses(whRes.data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product_id || !form.warehouse_id || form.quantity <= 0) {
      alert("Product, warehouse, and valid quantity are required");
      return;
    }

    // Get current stock
    const { data: product } = await supabase.from("products").select("stock_level").eq("id", form.product_id).single();
    const currentStock = product?.stock_level || 0;
    let newStock = currentStock;

    if (form.transaction_type === "inbound") newStock = currentStock + form.quantity;
    else if (form.transaction_type === "outbound") newStock = currentStock - form.quantity;
    else if (form.transaction_type === "adjustment") newStock = form.quantity;

    if (newStock < 0) {
      alert("Cannot go below zero stock");
      return;
    }

    // Update product stock
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock_level: newStock })
      .eq("id", form.product_id);
    if (stockError) {
      alert("Failed to update stock: " + stockError.message);
      return;
    }

    // Log transaction
    const { error: transError } = await supabase.from("warehouse_transactions").insert([{
      product_id: form.product_id,
      warehouse_id: form.warehouse_id,
      transaction_type: form.transaction_type,
      quantity: form.quantity,
      reference_number: form.reference_number,
      notes: form.notes,
    }]);

    if (transError) alert("Failed to log transaction: " + transError.message);
    else {
      setShowForm(false);
      setForm({ product_id: "", warehouse_id: "", transaction_type: "inbound", quantity: 1, reference_number: "", notes: "" });
      fetchData();
    }
  }

  const typeColors: Record<string, string> = {
    inbound: "bg-green-100 text-green-700",
    outbound: "bg-red-100 text-red-700",
    adjustment: "bg-yellow-100 text-yellow-700",
    transfer_in: "bg-blue-100 text-blue-700",
    transfer_out: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Stock Transactions</h1>
            <p className="text-gray-600">Inbound, outbound, adjustments, and transfers.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + New Transaction
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">No transactions yet.</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.product_name || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.warehouse_name || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${typeColors[tx.transaction_type] || "bg-gray-100"}`}>
                          {tx.transaction_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.reference_number || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{tx.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">New Stock Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product *</label>
                  <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full border rounded px-3 py-2" required>
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warehouse *</label>
                  <select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} className="w-full border rounded px-3 py-2" required>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transaction Type</label>
                  <select value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })} className="w-full border rounded px-3 py-2">
                    <option value="inbound">Inbound (Receive Stock)</option>
                    <option value="outbound">Outbound (Ship Stock)</option>
                    <option value="adjustment">Adjustment (Set Stock Level)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} className="w-full border rounded px-3 py-2" required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reference Number (PO, SO, etc.)</label>
                  <input type="text" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Record Transaction</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}