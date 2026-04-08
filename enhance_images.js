const fs = require('fs');
const content = `"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const emptyForm = { name: "", category: "", description: "", unit: "", status: "active", supplier: "", stock_level: "", image_url: "" };

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { checkUser(); fetchProducts(); }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) alert("Failed to fetch: " + error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  async function handleImageUpload(file) {
    const fileName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    setUploading(true);
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    setUploading(false);
    if (error) { alert("Upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name) { alert("Name is required"); return; }
    const { error } = await supabase.from("products").insert([{ ...form, stock_level: Number(form.stock_level) || 0 }]);
    if (error) alert("Failed to add: " + error.message);
    else { setForm(emptyForm); fetchProducts(); }
  }

  async function handleUpdate(product) {
    const { error } = await supabase.from("products").update({
      name: product.name, category: product.category, description: product.description,
      unit: product.unit, status: product.status, supplier: product.supplier,
      stock_level: Number(product.stock_level) || 0, image_url: product.image_url
    }).eq("id", product.id);
    if (error) alert("Failed to update: " + error.message);
    else { setSelectedProduct(null); fetchProducts(); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchProducts();
  }

  const totalStock = products.reduce((acc, p) => acc + Number(p.stock_level || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-gray-600">Manage products and inventory.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
            <form className="space-y-3" onSubmit={handleCreate}>
              <input type="text" placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2" />
                <input type="text" placeholder="Unit (kg, box...)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="border rounded-lg px-3 py-2" />
              </div>
              <textarea placeholder="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stock Level" value={form.stock_level} onChange={(e) => setForm({ ...form, stock_level: e.target.value })} className="border rounded-lg px-3 py-2" />
                <input type="text" placeholder="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="border rounded-lg px-3 py-2" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Product Image</label>
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await handleImageUpload(file); if (url) setForm({ ...form, image_url: url }); } }} className="w-full border rounded-lg px-3 py-2" />
                {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg" />}
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-lg">Create Product</button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Inventory Snapshot</h2>
            <p className="text-2xl font-bold">{products.length} products listed</p>
            <p className="text-gray-500 mt-2">Total stock units: {totalStock}</p>
            <p className="text-gray-500 mt-1">Active: {products.filter(p => p.status === "active").length}</p>
            <p className="text-gray-500 mt-1">Out of stock: {products.filter(p => Number(p.stock_level) === 0).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Products</h2>
            <button onClick={fetchProducts} className="text-sm px-3 py-1 bg-gray-100 rounded-lg">Refresh</button>
          </div>
          {loading ? <p>Loading...</p> : products.length === 0 ? <p className="text-gray-500">No products yet.</p> : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-xl p-4 flex gap-4 items-start">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-24 w-24 object-cover rounded-lg flex-shrink-0 shadow-sm" />
                  ) : (
                    <div className="h-24 w-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                  <div className="flex-1">
                    {selectedProduct && selectedProduct.id === product.id ? (
                      <div className="space-y-2">
                        <input type="text" value={selectedProduct.name} onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })} className="w-full border rounded px-3 py-2" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Category" value={selectedProduct.category || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })} className="border rounded px-3 py-2" />
                          <input type="text" placeholder="Unit" value={selectedProduct.unit || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })} className="border rounded px-3 py-2" />
                        </div>
                        <textarea value={selectedProduct.description || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })} className="w-full border rounded px-3 py-2" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" value={selectedProduct.stock_level || 0} onChange={(e) => setSelectedProduct({ ...selectedProduct, stock_level: Number(e.target.value) })} className="border rounded px-3 py-2" />
                          <input type="text" placeholder="Supplier" value={selectedProduct.supplier || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, supplier: e.target.value })} className="border rounded px-3 py-2" />
                        </div>
                        <select value={selectedProduct.status || "active"} onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })} className="w-full border rounded px-3 py-2">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                        <div>
                          <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await handleImageUpload(file); if (url) setSelectedProduct({ ...selectedProduct, image_url: url }); } }} className="w-full border rounded px-3 py-2" />
                          {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
                          {selectedProduct.image_url && <img src={selectedProduct.image_url} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded" />}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => handleUpdate(selectedProduct)}>Save</button>
                          <button className="px-4 py-2 rounded bg-gray-100" onClick={() => setSelectedProduct(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="text-gray-500 text-sm">{product.description}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {product.category && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{product.category}</span>}
                            {product.unit && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{product.unit}</span>}
                            <span className={\`text-xs px-2 py-1 rounded-full \${product.status === "active" ? "bg-green-50 text-green-600" : product.status === "out_of_stock" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}\`}>{product.status}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 md:items-end">
                          <p className="text-sm text-gray-500">Stock: {product.stock_level || 0}</p>
                          {product.supplier && <p className="text-xs text-gray-400">Supplier: {product.supplier}</p>}
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => setSelectedProduct(product)} className="px-4 py-2 rounded bg-gray-100 text-sm">Edit</button>
                            <button onClick={() => handleDelete(product.id)} className="px-4 py-2 rounded bg-red-50 text-red-600 text-sm">Delete</button>
                          </div>
                        </div>
                      </div>
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
fs.writeFileSync('app/admin/dashboard/page.tsx', content);
console.log('Dashboard with enhanced image previews updated!');
