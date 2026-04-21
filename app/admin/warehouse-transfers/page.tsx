"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Transfer = {
  id: string;
  transfer_number: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  from_warehouse_id: string;
  from_warehouse_name?: string;
  to_warehouse_id: string;
  to_warehouse_name?: string;
  status: string;
  notes: string;
  requested_by?: string;
  approved_by?: string;
  created_at: string;
  completed_at: string;
};

type Product = { id: string; name: string; stock_level: number };
type Warehouse = { id: string; name: string; code: string };

export default function WarehouseTransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    from_warehouse_id: "",
    to_warehouse_id: "",
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
      supabase
        .from("warehouse_transfers")
        .select(`*, products(name), from:from_warehouse_id(name), to:to_warehouse_id(name)`)
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, stock_level"),
      supabase.from("warehouses").select("id, name, code").eq("is_active", true),
    ]);

    if (transRes.error) console.error(transRes.error);
    else {
      const mapped = (transRes.data || []).map((t: any) => ({
        ...t,
        product_name: t.products?.name,
        from_warehouse_name: t.from?.name,
        to_warehouse_name: t.to?.name,
      }));
      setTransfers(mapped);
    }
    if (prodRes.error) alert("Failed to fetch products: " + prodRes.error.message);
    else setProducts(prodRes.data || []);
    if (whRes.error) alert("Failed to fetch warehouses: " + whRes.error.message);
    else setWarehouses(whRes.data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product_id || !form.from_warehouse_id || !form.to_warehouse_id || form.quantity <= 0) {
      alert("All fields are required");
      return;
    }
    if (form.from_warehouse_id === form.to_warehouse_id) {
      alert("Source and destination warehouses must be different");
      return;
    }

    // Check if source has enough stock
    const { data: product } = await supabase
      .from("products")
      .select("stock_level, warehouse_id")
      .eq("id", form.product_id)
      .single();
    if (product.warehouse_id !== form.from_warehouse_id) {
      alert("Product is not currently in the source warehouse. Please move it first via Stock Locations.");
      return;
    }
    if (product.stock_level < form.quantity) {
      alert(`Insufficient stock. Only ${product.stock_level} available in source warehouse.`);
      return;
    }

    const { error } = await supabase.from("warehouse_transfers").insert([{
      product_id: form.product_id,
      quantity: form.quantity,
      from_warehouse_id: form.from_warehouse_id,
      to_warehouse_id: form.to_warehouse_id,
      notes: form.notes,
      status: "pending",
    }]);

    if (error) alert("Failed to create transfer: " + error.message);
    else {
      setShowForm(false);
      resetForm();
      fetchData();
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    if (newStatus === "completed") {
      // Get transfer details
      const { data: transfer, error: fetchError } = await supabase
        .from("warehouse_transfers")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) {
        alert("Failed to fetch transfer: " + fetchError.message);
        return;
      }

      // Update stock: subtract from source, add to destination
      const { data: product } = await supabase
        .from("products")
        .select("stock_level")
        .eq("id", transfer.product_id)
        .single();

      if (product.stock_level < transfer.quantity) {
        alert("Insufficient stock to complete this transfer.");
        return;
      }

      // Update product stock
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock_level: product.stock_level - transfer.quantity })
        .eq("id", transfer.product_id);
      if (stockError) {
        alert("Failed to update source stock: " + stockError.message);
        return;
      }

      // Log outbound transaction from source
      await supabase.from("warehouse_transactions").insert([{
        product_id: transfer.product_id,
        warehouse_id: transfer.from_warehouse_id,
        transaction_type: "transfer_out",
        quantity: transfer.quantity,
        reference_number: transfer.transfer_number,
        notes: `Transfer to ${transfer.to_warehouse_id}`,
      }]);

      // Log inbound transaction to destination
      await supabase.from("warehouse_transactions").insert([{
        product_id: transfer.product_id,
        warehouse_id: transfer.to_warehouse_id,
        transaction_type: "transfer_in",
        quantity: transfer.quantity,
        reference_number: transfer.transfer_number,
        notes: `Transfer from ${transfer.from_warehouse_id}`,
      }]);

      // Update product's warehouse assignment to destination
      await supabase
        .from("products")
        .update({ warehouse_id: transfer.to_warehouse_id })
        .eq("id", transfer.product_id);

      // Update transfer status and completion time
      const { error: updateError } = await supabase
        .from("warehouse_transfers")
        .update({ status: newStatus, completed_at: new Date().toISOString() })
        .eq("id", id);
      if (updateError) alert("Failed to complete transfer: " + updateError.message);
    } else {
      const { error } = await supabase
        .from("warehouse_transfers")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) alert("Failed to update status: " + error.message);
    }
    fetchData();
  }

  async function deleteTransfer(id: string) {
    if (!confirm("Delete this transfer?")) return;
    const { error } = await supabase.from("warehouse_transfers").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchData();
  }

  function resetForm() {
    setForm({
      product_id: "",
      quantity: 1,
      from_warehouse_id: "",
      to_warehouse_id: "",
      notes: "",
    });
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_transit: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Transfers</h1>
            <p className="text-gray-600">Move stock between warehouses.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Transfer
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : transfers.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No transfers yet. Click "New Transfer" to move stock.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From → To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{tr.transfer_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tr.product_name || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tr.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tr.from_warehouse_name || "?"} → {tr.to_warehouse_name || "?"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[tr.status] || "bg-gray-100"}`}>
                          {tr.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tr.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {tr.status !== "completed" && tr.status !== "cancelled" && (
                          <>
                            <button
                              onClick={() => updateStatus(tr.id, "completed")}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateStatus(tr.id, "cancelled")}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {tr.status === "pending" && (
                          <button
                            onClick={() => updateStatus(tr.id, "in_transit")}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Mark In Transit
                          </button>
                        )}
                        <button onClick={() => deleteTransfer(tr.id)} className="text-gray-500 hover:text-gray-700">
                          Delete
                        </button>
                      </td>
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
              <h2 className="text-xl font-bold mb-4">New Warehouse Transfer</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product *</label>
                  <select
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock_level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">From Warehouse *</label>
                  <select
                    value={form.from_warehouse_id}
                    onChange={(e) => setForm({ ...form, from_warehouse_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select source</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To Warehouse *</label>
                  <select
                    value={form.to_warehouse_id}
                    onChange={(e) => setForm({ ...form, to_warehouse_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select destination</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Reason for transfer, etc."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    Create Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}