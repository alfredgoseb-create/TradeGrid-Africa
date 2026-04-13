"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Order = {
  id: string;
  order_number: string;
  product_name: string;
  quantity: number;
  customer_name: string;
  delivery_address: string;
  status: string;
  created_at: string;
};

export default function OrderStatusPage() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function lookupOrders(e: React.FormEvent) {
    e.preventDefault();
    if (!email && !orderNumber) {
      alert("Please enter your email or order number");
      return;
    }
    setLoading(true);
    setSearched(true);
    let query = supabase.from("orders").select("*");
    if (email) query = query.eq("customer_email", email);
    if (orderNumber) query = query.eq("order_number", orderNumber);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      alert("Failed to fetch orders");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </h1>
          <Link href="/store" className="text-sm text-blue-600 hover:underline">
            Browse Products
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Track Your Order</h2>
          <p className="text-gray-600 mb-6">Enter your email address or order number to check status.</p>
          <form onSubmit={lookupOrders} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="text-center text-gray-400">or</div>
            <div>
              <label className="block text-sm font-medium mb-1">Order Number</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-20250409-1234"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {searched && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Your Orders</h3>
            {loading ? (
              <p>Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders found for the provided information.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-mono text-sm text-gray-500">{order.order_number}</p>
                        <p className="font-semibold">{order.product_name}</p>
                        <p className="text-sm">Quantity: {order.quantity}</p>
                        <p className="text-sm text-gray-600">Delivery to: {order.delivery_address}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}