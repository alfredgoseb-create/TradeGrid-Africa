"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Warehouse = {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  manager_name: string;
  manager_email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
};

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    address: "",
    manager_name: "",
    manager_email: "",
    phone: "",
    is_active: true,
  });

  useEffect(() => {
    checkUser();
    fetchWarehouses();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchWarehouses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .order("name");
    if (error) alert("Failed to fetch: " + error.message);
    else setWarehouses(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.code) {
      alert("Name and code are required");
      return;
    }
    if (editing) {
      const { error } = await supabase
        .from("warehouses")
        .update(form)
        .eq("id", editing.id);
      if (error) alert("Failed to update: " + error.message);
      else {
        setShowForm(false);
        setEditing(null);
        fetchWarehouses();
      }
    } else {
      const { error } = await supabase.from("warehouses").insert([form]);
      if (error) alert("Failed to create: " + error.message);
      else {
        setShowForm(false);
        resetForm();
        fetchWarehouses();
      }
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase
      .from("warehouses")
      .update({ is_active: !current })
      .eq("id", id);
    if (error) alert("Failed to update: " + error.message);
    else fetchWarehouses();
  }

  async function deleteWarehouse(id: string) {
    if (!confirm("Delete this warehouse? This will remove stock assignments.")) return;
    const { error } = await supabase.from("warehouses").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchWarehouses();
  }

  function resetForm() {
    setForm({
      name: "",
      code: "",
      location: "",
      address: "",
      manager_name: "",
      manager_email: "",
      phone: "",
      is_active: true,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Warehouses</h1>
            <p className="text-gray-600">Manage storage locations, bin assignments, and stock.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Warehouse
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : warehouses.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No warehouses yet. Click "New Warehouse" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warehouses.map((wh) => (
                    <tr key={wh.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wh.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wh.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wh.location || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wh.manager_name || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(wh.id, wh.is_active)}
                          className={`px-2 py-1 text-xs rounded-full ${wh.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {wh.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditing(wh);
                            setForm({
                              name: wh.name,
                              code: wh.code,
                              location: wh.location || "",
                              address: wh.address || "",
                              manager_name: wh.manager_name || "",
                              manager_email: wh.manager_email || "",
                              phone: wh.phone || "",
                              is_active: wh.is_active,
                            });
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteWarehouse(wh.id)}
                          className="text-red-600 hover:text-red-900"
                        >
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
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editing ? "Edit Warehouse" : "New Warehouse"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Code *</label>
                    <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border rounded px-3 py-2" required placeholder="e.g., WH-001" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="City/Region" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Manager Name</label>
                    <input type="text" value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Manager Email</label>
                    <input type="email" value={form.manager_email} onChange={(e) => setForm({ ...form, manager_email: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                    Active
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">{editing ? "Save Changes" : "Create Warehouse"}</button>
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