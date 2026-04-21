"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  stock_level: number;
  status: string;
  image_url: string;
  supplier: string;
  created_at: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"none" | "order" | "contact">("none");
  const [inquiry, setInquiry] = useState({ name: "", email: "", message: "" });
  const [order, setOrder] = useState({ quantity: 1, customer_name: "", customer_email: "", delivery_address: "" });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (params.id) fetchProduct();
  }, [params.id]);

  async function fetchProduct() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) {
      router.push("/store");
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  async function handleSendInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      alert("Please fill in all fields");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("inquiries").insert([{
      product_id: product?.id,
      product_name: product?.name,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message,
    }]);
    setSending(false);
    if (error) {
      alert("Failed to send inquiry: " + error.message);
      return;
    }
    setSuccessMsg("Inquiry sent! The supplier will contact you soon.");
    setActiveForm("none");
    setInquiry({ name: "", email: "", message: "" });
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!order.customer_name || !order.customer_email || !order.delivery_address || order.quantity < 1) {
      alert("Please fill in all fields");
      return;
    }
    if (product && order.quantity > product.stock_level) {
      alert(`Only ${product.stock_level} units available`);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("orders").insert([{
      product_id: product?.id,
      product_name: product?.name,
      quantity: order.quantity,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      delivery_address: order.delivery_address,
      status: "pending",
    }]);
    setSending(false);
    if (error) {
      alert("Failed to place order: " + error.message);
      return;
    }
    setSuccessMsg("Order placed successfully! You will be contacted shortly.");
    setActiveForm("none");
    setOrder({ quantity: 1, customer_name: "", customer_email: "", delivery_address: "" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <Link href="/store">
            <h1 className="text-2xl font-bold cursor-pointer">
              NamLogix <span className="text-blue-600">AFRICA</span>
            </h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/store" className="text-sm text-gray-600 hover:text-gray-900">← Back to Store</Link>
            <Link href="/order-status" className="text-sm text-gray-600 hover:text-gray-900">Track Order</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Admin Login</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMsg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-64">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="max-w-full max-h-80 object-contain rounded-lg" />
              ) : (
                <div className="text-gray-400 text-center p-8">No image available</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm mb-4">
                  {product.category}
                </span>
              )}
              <div className="space-y-2 mb-6">
                <p className="text-gray-600">{product.description}</p>
                <div className="flex gap-4 text-sm mt-3">
                  {product.unit && <div><span className="font-medium">Unit:</span> {product.unit}</div>}
                  <div>
                    <span className="font-medium">Stock:</span>{" "}
                    <span className={Number(product.stock_level) > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {Number(product.stock_level) > 0 ? `${product.stock_level} available` : "Out of stock"}
                    </span>
                  </div>
                </div>
                {product.supplier && (
                  <div className="text-sm"><span className="font-medium">Supplier:</span> {product.supplier}</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveForm(activeForm === "order" ? "none" : "order")}
                  disabled={Number(product.stock_level) === 0}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    Number(product.stock_level) > 0
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {activeForm === "order" ? "Hide Form" : "Order Now"}
                </button>
                <button
                  onClick={() => setActiveForm(activeForm === "contact" ? "none" : "contact")}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {activeForm === "contact" ? "Hide Form" : "Contact Supplier"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeForm === "order" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Order {product.name}</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number" min="1" max={product.stock_level}
                  value={order.quantity}
                  onChange={(e) => setOrder({ ...order, quantity: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Available: {product.stock_level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input
                  type="text" value={order.customer_name}
                  onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Email *</label>
                <input
                  type="email" value={order.customer_email}
                  onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Address *</label>
                <textarea
                  rows={3} value={order.delivery_address}
                  onChange={(e) => setOrder({ ...order, delivery_address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit" disabled={sending}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  {sending ? "Placing Order..." : "Place Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm("none")}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeForm === "contact" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Inquire about {product.name}</h2>
            <form onSubmit={handleSendInquiry} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input
                  type="text" value={inquiry.name}
                  onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Email *</label>
                <input
                  type="email" value={inquiry.email}
                  onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea
                  rows={4} value={inquiry.message}
                  onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit" disabled={sending}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  {sending ? "Sending..." : "Send Inquiry"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm("none")}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/store" className="text-blue-600 hover:underline">← Back to all products</Link>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} NamLogix Africa – Connecting Southern African Trade
        </div>
      </footer>
    </div>
  );
}
