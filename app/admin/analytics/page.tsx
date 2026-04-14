// app/admin/analytics/page.tsx
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
  LineChart,
  Line,
} from "recharts";

type Product = {
  id: string;
  name: string;
  category: string;
  stock_level: number;
  supplier: string;
};

type Supplier = {
  id: string;
  name: string;
  category: string;
};

type Order = {
  id: string;
  status: string;
  created_at: string;
  quantity: number;
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AnalyticsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
    // Fetch products
    const { data: productsData } = await supabase.from("products").select("*");
    setProducts(productsData || []);
    // Fetch suppliers
    const { data: suppliersData } = await supabase.from("suppliers").select("*");
    setSuppliers(suppliersData || []);
    // Fetch orders
    const { data: ordersData } = await supabase.from("orders").select("*");
    setOrders(ordersData || []);
    setLoading(false);
  }

  // Prepare data for charts
  const productsByCategory = () => {
    const categoryMap = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const ordersByStatus = () => {
    const statusMap = new Map<string, number>();
    orders.forEach((o) => {
      const status = o.status || "pending";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const lowStockProducts = () => {
    return products
      .filter((p) => p.stock_level <= 10 && p.stock_level > 0)
      .map((p) => ({ name: p.name, stock: p.stock_level }));
  };

  const ordersOverTime = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();
    const orderCounts = last7Days.map((date) => {
      const count = orders.filter((o) => o.created_at?.startsWith(date)).length;
      return { date, count };
    });
    return orderCounts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 mb-8">Key metrics and visual insights</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Products</h3>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Suppliers</h3>
            <p className="text-3xl font-bold">{suppliers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Orders</h3>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
            <p className="text-3xl font-bold text-yellow-600">{lowStockProducts().length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products by Category */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Products by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productsByCategory()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatus().map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Low Stock Products (≤10 units)</h2>
            {lowStockProducts().length === 0 ? (
              <p className="text-gray-500 text-center py-8">No low stock products</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lowStockProducts()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#F59E0B" name="Stock Level" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders Over Time (Last 7 days) */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders Over Time (Last 7 days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersOverTime()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#10B981" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}