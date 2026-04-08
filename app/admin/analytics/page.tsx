"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function AnalyticsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkUser(); fetchData(); }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchData() {
    setLoading(true);
    const [p, s, o] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("suppliers").select("*"),
      supabase.from("orders").select("*"),
    ]);
    setProducts(p.data || []);
    setSuppliers(s.data || []);
    setOrders(o.data || []);
    setLoading(false);
  }

  const totalStock = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stock || 0)), 0);
  const avgPrice = products.length
    ? products.reduce((acc, p) => acc + Number(p.price || 0), 0) / products.length
    : 0;
  const lowStock = products.filter(p => Number(p.stock) <= 5);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total_price || 0), 0);

  const stats = [
    { label: "Total Products", value: products.length, color: "bg-blue-50 text-blue-700" },
    { label: "Total Suppliers", value: suppliers.length, color: "bg-purple-50 text-purple-700" },
    { label: "Total Stock Units", value: totalStock, color: "bg-green-50 text-green-700" },
    { label: "Inventory Value", value: "N$" + totalValue.toFixed(2), color: "bg-yellow-50 text-yellow-700" },
    { label: "Avg Product Price", value: "N$" + avgPrice.toFixed(2), color: "bg-pink-50 text-pink-700" },
    { label: "Total Orders", value: totalOrders, color: "bg-orange-50 text-orange-700" },
    { label: "Total Revenue", value: "N$" + totalRevenue.toFixed(2), color: "bg-teal-50 text-teal-700" },
    { label: "Low Stock Items", value: lowStock.length, color: lowStock.length > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-500">Overview of your trade platform performance.</p>
        </div>

        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className={`rounded-xl p-5 ${stat.color}`}>
                  <p className="text-sm font-medium opacity-70">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {lowStock.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-red-700 mb-3">
                  Low Stock Alert ({lowStock.length} items)
                </h2>
                <div className="space-y-2">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-white rounded-lg px-4 py-2">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-red-600 font-semibold">Stock: {p.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Products by Value</h2>
                {products.length === 0 ? (
                  <p className="text-gray-400">No products yet.</p>
                ) : (
                  <div className="space-y-3">
                    {[...products]
                      .sort((a, b) => (Number(b.price) * Number(b.stock)) - (Number(a.price) * Number(a.stock)))
                      .slice(0, 5)
                      .map((p) => (
                        <div key={p.id} className="flex justify-between items-center">
                          <span className="text-gray-700">{p.name}</span>
                          <span className="font-semibold text-green-700">
                            N${(Number(p.price || 0) * Number(p.stock || 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Suppliers by Category</h2>
                {suppliers.length === 0 ? (
                  <p className="text-gray-400">No suppliers yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(
                      suppliers.reduce((acc: any, s) => {
                        const cat = s.category || "Uncategorized";
                        acc[cat] = (acc[cat] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between items-center">
                        <span className="text-gray-700">{cat}</span>
                        <span className="font-semibold text-blue-700">{count as number} supplier{(count as number) > 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
