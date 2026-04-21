"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Product = {
  id: string;
  name: string;
  category: string;
  stock_level: number;
  warehouse_id: string | null;
  bin_location: string | null;
};

type Warehouse = {
  id: string;
  name: string;
  code: string;
};

export default function StockLocationsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ warehouse_id: "", bin_location: "" });

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
    const [productsRes, warehousesRes] = await Promise.all([
      supabase.from("products").select("id, name, category, stock_level, warehouse_id, bin_location").order("name"),
      supabase.from("warehouses").select("id, name, code").eq("is_active", true)
    ]);
    if (productsRes.error) alert("Failed to fetch products: " + productsRes.error.message);
    else setProducts(productsRes.data || []);
    if (warehousesRes.error) alert("Failed to fetch warehouses: " + warehousesRes.error.message);
    else setWarehouses(warehousesRes.data || []);
    setLoading(false);
  }

  async function updateStockLocation(productId: string, warehouseId: string | null, binLocation: string | null) {
    const { error } = await supabase
      .from("products")
      .update({ warehouse_id: warehouseId || null, bin_location: binLocation || null })
      .eq("id", productId);
    if (error) alert("Failed to update: " + error.message);
    else {
      setEditingId(null);
      fetchData();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Stock Locations</h1>
          <p className="text-gray-600">Assign products to warehouses and bin locations.</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bin Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock_level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === product.id ? (
                          <select
                            value={editForm.warehouse_id}
                            onChange={(e) => setEditForm({ ...editForm, warehouse_id: e.target.value })}
                            className="border rounded px-2 py-1"
                          >
                            <option value="">None</option>
                            {warehouses.map((wh) => (
                              <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                            ))}
                          </select>
                        ) : (
                          warehouses.find(w => w.id === product.warehouse_id)?.name || "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === product.id ? (
                          <input
                            type="text"
                            value={editForm.bin_location}
                            onChange={(e) => setEditForm({ ...editForm, bin_location: e.target.value })}
                            className="border rounded px-2 py-1"
                            placeholder="A-01-02"
                          />
                        ) : (
                          product.bin_location || "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === product.id ? (
                          <>
                            <button
                              onClick={() => updateStockLocation(product.id, editForm.warehouse_id || null, editForm.bin_location || null)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(product.id);
                              setEditForm({
                                warehouse_id: product.warehouse_id || "",
                                bin_location: product.bin_location || "",
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}