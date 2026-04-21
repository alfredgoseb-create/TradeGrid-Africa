"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const transportModes = [
  { value: "road", label: "🚛 Road (Truck/Van)" },
  { value: "rail", label: "🚂 Rail" },
  { value: "air", label: "✈️ Air" },
  { value: "sea", label: "🚢 Sea" },
  { value: "any", label: "🌍 Any / Best Option" },
];

export default function RequestCargoPage() {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    pickup_location: "",
    delivery_location: "",
    weight_kg: "",
    volume_cbm: "",
    transport_mode: "any",
    preferred_date: "",
    budget: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.customer_name || !form.pickup_location || !form.delivery_location) {
      setError("Please fill in all required fields (*)");
      setSubmitting(false);
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone || null,
      customer_email: form.customer_email || null,
      pickup_location: form.pickup_location,
      delivery_location: form.delivery_location,
      weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
      volume_cbm: form.volume_cbm ? parseFloat(form.volume_cbm) : null,
      transport_mode: form.transport_mode,
      preferred_date: form.preferred_date || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      description: form.description || null,
      status: "open",
    };

    const { error: supabaseError } = await supabase
      .from("cargo_requests")
      .insert([payload]);

    if (supabaseError) {
      setError("Failed to submit request. Please try again.");
      console.error(supabaseError);
    } else {
      setSuccess(true);
      setForm({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        pickup_location: "",
        delivery_location: "",
        weight_kg: "",
        volume_cbm: "",
        transport_mode: "any",
        preferred_date: "",
        budget: "",
        description: "",
      });
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              NamLogix <span className="text-blue-600">AFRICA</span>
            </h1>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your cargo request has been received. Our logistics team will review it and contact you shortly with quotes from available carriers.
            </p>
            <Link
              href="/request-cargo"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Another Request
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </h1>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/store" className="text-sm text-gray-600 hover:text-gray-900">
              Store
            </Link>
            <Link href="/routes" className="text-sm text-gray-600 hover:text-gray-900">
              Trade Routes
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Request Cargo Transport</h1>
          <p className="text-gray-600 mb-6">
            Fill out the form below and we'll connect you with reliable carriers across Southern Africa.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Info */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Your Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={form.customer_phone}
                      onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="+264 81 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={form.customer_email}
                      onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Route Info */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Pickup & Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.pickup_location}
                    onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.delivery_location}
                    onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Cargo Details */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Cargo Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.volume_cbm}
                    onChange={(e) => setForm({ ...form, volume_cbm: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., 15.5"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Preferred Transport Mode</label>
                <select
                  value={form.transport_mode}
                  onChange={(e) => setForm({ ...form, transport_mode: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {transportModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timing & Budget */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Timing & Budget</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget (N$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Additional Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Describe your cargo, special handling requirements, dimensions, etc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Cargo Request"}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-300"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} NamLogix Africa – Connecting Southern African Trade
        </div>
      </footer>
    </div>
  );
}