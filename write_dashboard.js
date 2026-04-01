const fs = require('fs');
const code = `"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { checkUser(); fetchProducts(); }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) alert("Failed to fetch products: " + error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { name, description, price, stock } = form;
    if (!name || !price || !stock) { alert("Name, price, and stock are required"); return; }
    const { error } = await supabase.from("products").insert([{ name, description, price: Number(price), stock: Number(stock) }]);
    if (error) alert("Failed to add product: " + error.message);
    else { setForm({ name: "", description: "", price: "", stock: "" }); fetchProducts(); }
  }

  async function handleUpdate(product) {
    const { error } = await supabase.from("products").update({ price: product.price, stock: product.stock, description: product.description }).eq("id", product.id);
    if (error) alert("Failed to update: " + error.message);
    else { setSelectedProduct(null); fetchProducts(); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchProducts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-gray-600">Manage products, inventory, and storefront data.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
            <form className="space-y-4" onSubmit={handleCreate}>
              <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border rounded-lg px-3 py-2" />
                <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border rounded-lg px-3 py-2" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90">Create Product</button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Inventory Snapshot</h2>
            <p className="text-2xl font-bold">{products.length} products listed</p>
            <p className="text-gray-500">Total stock: {products.reduce((acc, item) => acc + Number(item.stock || 0), 0)}</p>
            <p className="text-gray-500">Average price: N${products.length ? (products.reduce((acc, item) => acc + Number(item.price || 0), 0) / products.length).toFixed(2) : "0.00"}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Products</h2>
            <button onClick={fetchProducts} className="text-sm px-3 py-1 bg-gray-100 rounded-lg">Refresh</button>
          </div>
          {loading ? <p>Loading products...</p> : products.length === 0 ? <p className="text-gray-500">No products yet.</p> : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    {selectedProduct && selectedProduct.id === product.id ? (
                      <div className="space-y-2">
                        <input type="text" value={selectedProduct.name} onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })} className="w-full border rounded px-3 py-2" />
                        <textarea value={selectedProduct.description || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })} className="w-full border rounded px-3 py-2" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={selectedProduct.price} onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })} className="border rounded px-3 py-2" />
                          <input type="number" value={selectedProduct.stock} onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })} className="border rounded px-3 py-2" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600">{product.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    {selectedProduct && selectedProduct.id === product.id ? (
                      <>
                        <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => handleUpdate(selectedProduct)}>Save changes</button>
                        <button className="text-sm text-gray-500" onClick={() => setSelectedProduct(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-lg">N${product.price != null ? Number(product.price).toFixed(2) : "0.00"}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedProduct(product)} className="px-4 py-2 rounded bg-gray-100">Edit</button>
                          <button onClick={() => handleDelete(product.id)} className="px-4 py-2 rounded bg-red-50 text-red-600">Delete</button>
                        </div>
                      </>
                    )}
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
fs.writeFileSync('app/admin/dashboard/page.tsx', code);
console.log('Done!');
