// app/store/[id]/page.tsx (full replacement)
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
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [inquiry, setInquiry] = useState({ name: "", email: "", message: "" });
  const [order, setOrder] = useState({ quantity: 1, customer_name: "", customer_email: "", delivery_address: "" });
  const [sending, setSending] = useState(false);

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
      console.error(error);
      alert("Product not found");
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
    const { error: dbError } = await supabase.from("inquiries").insert([
      {
        product_id: product?.id,
        product_name: product?.name,
        name: inquiry.name,
        email: inquiry.email,
        message: inquiry.message,
        created_at: new Date(),
      },
    ]);
    if (dbError) {
      console.error(dbError);
      alert("Failed to save inquiry");
      setSending(false);
      return;
    }
    try {
      await fetch("/api/send-inquiry-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiry.name,
          email: inquiry.email,
          productName: product?.name,
          message: inquiry.message,
        }),
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
    }
    alert("Inquiry sent! The supplier will contact you soon.");
    setShowContactForm(false);
    setInquiry({ name: "", email: "", message: "" });
    setSending(false);
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!order.customer_name || !order.customer_email || !order.delivery_address || order.quantity < 1) {
      alert("Please fill in all fields and enter a valid quantity");
      return;
    }
    if (product && order.quantity > product.stock_level) {
      alert(`Only ${product.stock_level} units available`);
      return;
    }
    setSending(true);
    const { data, error } = await supabase.from("orders").insert([
      {
        product_id: product?.id,
        product_name: product?.name,
        quantity: order.quantity,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        delivery_address: order.delivery_address,
        status: "pending",
      },
    ]).select();
    if (error) {
      console.error(error);
      alert("Failed to place order. Please try again.");
      setSending(false);
      return;
    }
    // Send confirmation email (optional)
    try {
      await fetch("/api/send-order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data[0].id,
          productName: product?.name,
          quantity: order.quantity,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          deliveryAddress: order.delivery_address,
        }),
      });
    } catch (err) { console.error(err); }
    alert("Order placed successfully! You will receive a confirmation email shortly.");
    setShowOrderForm(false);
    setOrder({ quantity: 1, customer_name: "", customer_email: "", delivery_address: "" });
    setSending(false);
    // Optionally redirect to a thank you page
    // router.push("/order-confirmation");
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </h1>
          <Link href="/store" className="text-sm text-blue-600 hover:underline">
            ← Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="max-w-full max-h-96 object-contain" />
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm mb-4">
                  {product.category}
                </span>
              )}
              <div className="space-y-3 mb-6">
                <p className="text-gray-600">{product.description}</p>
                <div className="flex gap-4 text-sm">
                  {product.unit && <div><span className="font-medium">Unit:</span> {product.unit}</div>}
                  <div>
                    <span className="font-medium">Stock:</span>{" "}
                    <span className={Number(product.stock_level) > 0 ? "text-green-600" : "text-red-600"}>
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
                  onClick={() => setShowOrderForm(true)}
                  disabled={Number(product.stock_level) === 0}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    Number(product.stock_level) > 0
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Order Now
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Inquire about {product.name}</h3>
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name *</label>
                  <input type="text" value={inquiry.name} onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Email *</label>
                  <input type="email" value={inquiry.email} onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea rows={4} value={inquiry.message} onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={sending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">{sending ? "Sending..." : "Send Inquiry"}</button>
                  <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Form Modal */}
        {showOrderForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Order {product.name}</h3>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input type="number" min="1" max={product.stock_level} value={order.quantity} onChange={(e) => setOrder({ ...order, quantity: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" required />
                  <p className="text-xs text-gray-500 mt-1">Available: {product.stock_level}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name *</label>
                  <input type="text" value={order.customer_name} onChange={(e) => setOrder({ ...order, customer_name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Email *</label>
                  <input type="email" value={order.customer_email} onChange={(e) => setOrder({ ...order, customer_email: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address *</label>
                  <textarea rows={2} value={order.delivery_address} onChange={(e) => setOrder({ ...order, delivery_address: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={sending} className="flex-1 bg-green-600 text-white py-2 rounded-lg">{sending ? "Placing..." : "Place Order"}</button>
                  <button type="button" onClick={() => setShowOrderForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}