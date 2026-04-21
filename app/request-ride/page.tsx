"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RequestRidePage() {
  const [form, setForm] = useState({
    passenger_name: "",
    passenger_phone: "",
    passenger_email: "",
    origin: "",
    destination: "",
    travel_date: "",
    passenger_count: "1",
    budget: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.passenger_name || !form.origin || !form.destination) {
      setError("Please fill in all required fields (*)");
      setSubmitting(false);
      return;
    }

    const payload = {
      passenger_name: form.passenger_name,
      passenger_phone: form.passenger_phone || null,
      passenger_email: form.passenger_email || null,
      origin: form.origin,
      destination: form.destination,
      travel_date: form.travel_date || null,
      passenger_count: parseInt(form.passenger_count),
      budget: form.budget ? parseFloat(form.budget) : null,
      notes: form.notes || null,
      status: "open",
    };

    const { error: supabaseError } = await supabase
      .from("passenger_trip_requests")
      .insert([payload]);

    if (supabaseError) {
      setError("Failed to submit request. Please try again.");
      console.error(supabaseError);
    } else {
      setSuccess(true);
      setForm({
        passenger_name: "",
        passenger_phone: "",
        passenger_email: "",
        origin: "",
        destination: "",
        travel_date: "",
        passenger_count: "1",
        budget: "",
        notes: "",
      });
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">NamLogix <span className="text-blue-600">AFRICA</span></h1>
            <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Ride Request Submitted!</h2>
            <p className="text-gray-600 mb-6">We'll notify you when a vehicle owner matches your route.</p>
            <Link href="/request-ride" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Submit Another Request</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">NamLogix <span className="text-blue-600">AFRICA</span></h1>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/request-cargo" className="text-sm text-gray-600 hover:text-gray-900">Request Cargo</Link>
            <Link href="/cargo-bids" className="text-sm text-gray-600 hover:text-gray-900">Place Bid</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">Request a Ride</h1>
          <p className="text-gray-600 mb-6">Find a vehicle owner traveling your route.</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" required value={form.passenger_name} onChange={(e) => setForm({ ...form, passenger_name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={form.passenger_phone} onChange={(e) => setForm({ ...form, passenger_phone: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.passenger_email} onChange={(e) => setForm({ ...form, passenger_email: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Pickup Location *</label><input type="text" required value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Dropoff Location *</label><input type="text" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Travel Date</label><input type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Number of Passengers</label><input type="number" min="1" value={form.passenger_count} onChange={(e) => setForm({ ...form, passenger_count: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Budget (N$)</label><input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Notes</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Special requirements, luggage, etc." /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">{submitting ? "Submitting..." : "Submit Request"}</button>
              <Link href="/" className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg text-center">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}