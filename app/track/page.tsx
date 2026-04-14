// app/track/page.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Shipment = {
  id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  current_location: string;
  estimated_delivery: string;
  shipped_at: string;
  delivered_at: string;
  notes: string;
  updated_at: string;
  orders?: { product_name: string; customer_name: string };
};

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function trackShipment(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }
    setLoading(true);
    setError("");
    setShipment(null);
    const { data, error: dbError } = await supabase
      .from("shipments")
      .select(`*, orders ( product_name, customer_name )`)
      .eq("tracking_number", trackingNumber.trim())
      .maybeSingle();
    if (dbError) {
      console.error(dbError);
      setError("Failed to lookup tracking number");
    } else if (!data) {
      setError("No shipment found with that tracking number");
    } else {
      setShipment(data);
    }
    setLoading(false);
  }

  const statusSteps = [
    { key: "pending", label: "Order Received", description: "We have received your order." },
    { key: "processing", label: "Processing", description: "Your shipment is being prepared." },
    { key: "in_transit", label: "In Transit", description: "Your package is on the way." },
    { key: "customs_hold", label: "Customs Hold", description: "Awaiting customs clearance." },
    { key: "delivered", label: "Delivered", description: "Your package has been delivered." },
  ];

  const currentStatusIndex = shipment ? statusSteps.findIndex(s => s.key === shipment.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </h1>
          <Link href="/store" className="text-sm text-blue-600 hover:underline">
            Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Track Your Shipment</h2>
          <p className="text-gray-600 mb-6">Enter your tracking number to see real-time status.</p>
          <form onSubmit={trackShipment} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., NAM123456789"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>

        {shipment && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Tracking Number: {shipment.tracking_number}</h3>
                {shipment.carrier && <p className="text-gray-600">Carrier: {shipment.carrier}</p>}
                {shipment.orders && (
                  <p className="text-sm text-gray-500 mt-1">
                    Product: {shipment.orders.product_name} – Customer: {shipment.orders.customer_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  shipment.status === "delivered" ? "bg-green-100 text-green-700" :
                  shipment.status === "customs_hold" ? "bg-orange-100 text-orange-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {shipment.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between">
                {statusSteps.map((step, idx) => (
                  <div key={step.key} className="flex-1 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                      idx <= currentStatusIndex ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {idx < currentStatusIndex ? "✓" : idx + 1}
                    </div>
                    <p className="text-xs mt-2 font-medium">{step.label}</p>
                  </div>
                ))}
              </div>
              {currentStatusIndex >= 0 && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  {statusSteps[currentStatusIndex].description}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="border-t pt-4 grid md:grid-cols-2 gap-4 text-sm">
              {shipment.current_location && (
                <div>
                  <span className="font-medium">Current Location:</span>
                  <p>{shipment.current_location}</p>
                </div>
              )}
              {shipment.estimated_delivery && (
                <div>
                  <span className="font-medium">Estimated Delivery:</span>
                  <p>{new Date(shipment.estimated_delivery).toLocaleDateString()}</p>
                </div>
              )}
              {shipment.shipped_at && (
                <div>
                  <span className="font-medium">Shipped On:</span>
                  <p>{new Date(shipment.shipped_at).toLocaleDateString()}</p>
                </div>
              )}
              {shipment.delivered_at && (
                <div>
                  <span className="font-medium">Delivered On:</span>
                  <p>{new Date(shipment.delivered_at).toLocaleDateString()}</p>
                </div>
              )}
              {shipment.notes && (
                <div className="md:col-span-2">
                  <span className="font-medium">Notes:</span>
                  <p className="text-gray-600">{shipment.notes}</p>
                </div>
              )}
              <div className="md:col-span-2 text-gray-400 text-xs">
                Last updated: {new Date(shipment.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}