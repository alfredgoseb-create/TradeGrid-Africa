const fs = require('fs');
const code = `"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const emptyForm = { name: "", contact_name: "", email: "", phone: "", category: "" };

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { checkUser(); fetchSuppliers(); }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchSuppliers() {
    setLoading(true);
    const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    if (error) alert("Error: " + error.message);
    else setSuppliers(data);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) { alert("Name is required"); return; }
    if (editingId) {
      await supabase.from("suppliers").update(form).eq("id", editingId);
    } else {
      await supabase.from("suppliers").insert([form]);
    }
    setForm(emptyForm);
    setEditingId(null);
    fetchSuppliers();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this supplier?")) return;
    await supabase.from("suppliers").delete().eq("id", id);
    fetchSuppliers();
  }

  function handleEdit(s) {
    setForm({
      name: s.name || "",
      contact_name: s.contact_name || "",
      email: s.email || "",
      phone: s.phone || "",
      category: s.category || "",
    });
    setEditingId(s.id);
    window.scrollTo(0, 0);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Suppliers</h1>
            <p className="text-gray-500">Manage your suppliers.</p>
          </div>
          <button onClick={() => router.push("/admin/dashboard")} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Back to Dashboard</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Supplier" : "Add New Supplier"}</h2>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Supplier Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 col-span-2" />
            <input type="text" placeholder="Contact Person" value={form.contact_name || ""} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="text" placeholder="Category" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="email" placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="text" placeholder="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded-lg px-3 py-2" />
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg">{editingId ? "Save Changes" : "Add Supplier"}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="px-6 py-2 rounded-lg bg-gray-100">Cancel</button>}
            </div>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Suppliers ({suppliers.length})</h2>
          {loading ? <p>Loading...</p> : suppliers.length === 0 ? <p className="text-gray-400">No suppliers yet.</p> : (
            <div className="space-y-3">
              {suppliers.map((s) => (
                <div key={s.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{s.name}</h3>
                    <p className="text-gray-500 text-sm">{s.contact_name} {s.email} {s.phone}</p>
                    {s.category && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{s.category}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
fs.writeFileSync('app/admin/suppliers/page.tsx', code);
console.log('File written successfully!');
