// app/admin/suppliers/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Supplier = {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  category: string;
};

const emptyForm = { name: "", contact_name: "", email: "", phone: "", category: "" };

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchSuppliers();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchSuppliers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert("Error: " + error.message);
    else setSuppliers(data || []);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      alert("Name is required");
      return;
    }
    if (editingId) {
      await supabase.from("suppliers").update(form).eq("id", editingId);
    } else {
      await supabase.from("suppliers").insert([form]);
    }
    setForm(emptyForm);
    setEditingId(null);
    fetchSuppliers(); // ✅ refresh list immediately
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier?")) return;
    await supabase.from("suppliers").delete().eq("id", id);
    fetchSuppliers(); // ✅ refresh list immediately
  }

  function handleEdit(supplier: Supplier) {
    setForm({
      name: supplier.name || "",
      contact_name: supplier.contact_name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      category: supplier.category || "",
    });
    setEditingId(supplier.id);
    window.scrollTo(0, 0);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-gray-500">Manage your suppliers and contacts.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Supplier" : "Add New Supplier"}
          </h2>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Supplier Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-lg px-3 py-2 col-span-2"
            />
            <input
              type="text"
              placeholder="Contact Person"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg"
              >
                {editingId ? "Save Changes" : "Add Supplier"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Suppliers ({suppliers.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : suppliers.length === 0 ? (
            <p className="text-gray-400">No suppliers yet.</p>
          ) : (
            <div className="space-y-3">
              {suppliers.map((s) => (
                <div
                  key={s.id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{s.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {s.contact_name && `${s.contact_name} · `}
                      {s.email && `${s.email} · `}
                      {s.phone}
                    </p>
                    {s.category && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full inline-block mt-1">
                        {s.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}