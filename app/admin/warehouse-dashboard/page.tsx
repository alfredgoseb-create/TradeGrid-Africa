"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Warehouse = {
  id: string;
  name: string;
  code: string;
  location: string;
};

type Product = {
  id: string;
  name: string;
  stock_level: number;
  price: number;
  warehouse_id: string;
};

type TransferSummary = {
  pending: number;
  in_transit: number;
  completed: number;
  cancelled: number;
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function WarehouseDashboardPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transferSummary, setTransferSummary] = useState<TransferSummary>({
    pending: 0,
    in_transit: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

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
    
    // Fetch warehouses
    const { data: warehousesData } = await supabase
      .from("warehouses")
      .select("id, name, code, location")
      .eq("is_active", true);
    
    // Fetch products with stock and price
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, stock_level, price, warehouse_id");
    
    // Fetch transfer counts
    const { data: transfersData } = await supabase
      .from("warehouse_transfers")
      .select("status");
    
    setWarehouses(warehousesData || []);
    setProducts(productsData || []);
    
    if (transfersData) {
      const summary = {
        pending: transfersData.filter(t => t.status === "pending").length,
        in_transit: transfersData.filter(t => t.status === "in_transit").length,
        completed: transfersData.filter(t => t.status === "completed").length,
        cancelled: transfersData.filter(t => t.status === "cancelled").length,
      };
      setTransferSummary(summary);
    }
    
    setLoading(false);
  }

  // Calculate total stock value across all warehouses
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock_level || 0) * (p.price || 0), 0);
  
  // Calculate stock value per warehouse
  const stockByWarehouse = warehouses.map(wh => {
    const whProducts = products.filter(p => p.warehouse_id === wh.id);
    const value = whProducts.reduce((sum, p) => sum + (p.stock_level || 0) * (p.price || 0), 0);
    const units = whProducts.reduce((sum, p) => sum + (p.stock_level || 0), 0);
    return { name: wh.name, value, units, id: wh.id };
  }).filter(w => w.units > 0);

  // Low stock products per warehouse (stock ≤ 10)
  const lowStockByWarehouse = warehouses.map(wh => {
    const lowProducts = products.filter(p => p.warehouse_id === wh.id && (p.stock_level || 0) <= 10 && (p.stock_level || 0) > 0);
    const outOfStock = products.filter(p => p.warehouse_id === wh.id && (p.stock_level || 0) === 0);
    return { warehouse: wh.name, lowCount: lowProducts.length, outCount: outOfStock.length, products: lowProducts };
  }).filter(w => w.lowCount > 0 || w.outCount > 0);

  // Top 5 products by stock value
  const topProducts = [...products]
    .sort((a, b) => ((b.stock_level || 0) * (b.price || 0)) - ((a.stock_level || 0) * (a.price || 0)))
    .slice(0, 5)
    .map(p => ({ name: p.name, value: (p.stock_level || 0) * (p.price || 0), stock: p.stock_level }));

  // Transfer summary for pie chart
  const transferChartData = [
    { name: "Pending", value: transferSummary.pending },
    { name: "In Transit", value: transferSummary.in_transit },
    { name: "Completed", value: transferSummary.completed },
    { name: "Cancelled", value: transferSummary.cancelled },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Warehouse Dashboard</h1>
        <p className="text-gray-600 mb-8">Stock value, low stock alerts, and transfer insights.</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Stock Value</h3>
            <p className="text-3xl font-bold text-green-600">N${totalStockValue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Based on product prices</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Active Warehouses</h3>
            <p className="text-3xl font-bold">{warehouses.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Pending Transfers</h3>
            <p className="text-3xl font-bold text-yellow-600">{transferSummary.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
            <p className="text-3xl font-bold text-orange-600">
              {lowStockByWarehouse.reduce((sum, w) => sum + w.lowCount, 0)}
            </p>
          </div>
        </div>

        {/* Stock by Warehouse Chart */}
        {stockByWarehouse.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Stock Value by Warehouse</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `N$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Stock Value (N$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Transfer Summary Chart */}
        {transferChartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Transfer Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={transferChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transferChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products by Value */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Top Products by Value</h2>
              {topProducts.length === 0 ? (
                <p className="text-gray-500">No product data available</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                      </div>
                      <span className="font-semibold text-green-600">N${p.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Low Stock Alerts by Warehouse */}
        {lowStockByWarehouse.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚠️ Low Stock Alerts (≤10 units)</h2>
            <div className="space-y-6">
              {lowStockByWarehouse.map((wh) => (
                <div key={wh.warehouse}>
                  <h3 className="font-bold text-lg text-gray-700">{wh.warehouse}</h3>
                  {wh.lowCount > 0 && (
                    <div className="ml-4 mt-2 space-y-1">
                      {wh.products.map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <span>{p.name}</span>
                          <span className="text-orange-600 font-medium">{p.stock_level} units left</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {wh.outCount > 0 && (
                    <div className="ml-4 mt-2">
                      <p className="text-sm text-red-600">{wh.outCount} product(s) out of stock</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            ✅ No low stock items across all warehouses.
          </div>
        )}
      </div>
    </div>
  );
}