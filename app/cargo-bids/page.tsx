"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type CargoRequest = {
  id: string;
  request_number: string;
  pickup_location: string;
  delivery_location: string;
  weight_kg: number;
  volume_cbm: number;
  transport_mode: string;
  budget: number;
  description: string;
};

type Vehicle = {
  id: string;
  registration_number: string;
  make_model: string;
  vehicle_type: string;
  capacity_kg: number;
};

export default function CargoBidsPage() {
  const [requests, setRequests] = useState<CargoRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CargoRequest | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bidForm, setBidForm] = useState({
    owner_name: "",
    owner_phone: "",
    owner_email: "",
    vehicle_id: "",
    bid_amount: "",
    estimated_days: "",
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch open cargo requests
    const { data: requestsData } = await supabase
      .from("cargo_requests")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    setRequests(requestsData || []);

    // Fetch available vehicles
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("id, registration_number, make_model, vehicle_type, capacity_kg")
      .eq("is_available", true);
    setVehicles(vehiclesData || []);

    setLoading(false);
  }

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!bidForm.owner_name || !bidForm.vehicle_id || !bidForm.bid_amount) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bids").insert([{
      cargo_request_id: selectedRequest.id,
      owner_name: bidForm.owner_name,
      owner_phone: bidForm.owner_phone || null,
      owner_email: bidForm.owner_email || null,
      vehicle_id: bidForm.vehicle_id,
      bid_amount: parseFloat(bidForm.bid_amount),
      estimated_days: bidForm.estimated_days ? parseInt(bidForm.estimated_days) : null,
      message: bidForm.message || null,
      status: "pending",
    }]);

    if (error) {
      alert("Failed to submit bid: " + error.message);
    } else {
      setSuccess(true);
      setShowBidForm(false);
      setBidForm({
        owner_name: "",
        owner_phone: "",
        owner_email: "",
        vehicle_id: "",
        bid_amount: "",
        estimated_days: "",
        message: "",
      });
      // Refresh requests to remove the one just bid on (optional)
      fetchData();
    }
    setSubmitting(false);
  }

  const getVehicleDisplay = (vehicleId: string) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.vehicle_type} - ${v.registration_number} (${v.make_model || "N/A"})` : "";
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">NamLogix <span className="text-blue-600">AFRICA</span></h1>
            <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Bid Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your bid has been received. The cargo owner will review it and contact you if accepted.
            </p>
            <Link href="/cargo-bids" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
              View Other Requests
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">NamLogix <span className="text-blue-600">AFRICA</span></h1>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/request-cargo" className="text-sm text-gray-600 hover:text-gray-900">Request Cargo</Link>
            <Link href="/store" className="text-sm text-gray-600 hover:text-gray-900">Store</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Available Cargo Requests</h1>
          <p className="text-gray-600">Browse open shipping requests and place your bid.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No open cargo requests at the moment. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{req.request_number}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">OPEN</span>
                </div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">📍 {req.pickup_location} → 📍 {req.delivery_location}</p>
                  <div className="flex gap-3 text-sm">
                    {req.weight_kg && <span>📦 {req.weight_kg.toLocaleString()} kg</span>}
                    {req.volume_cbm && <span>📐 {req.volume_cbm} m³</span>}
                    <span>🚛 {req.transport_mode?.toUpperCase()}</span>
                  </div>
                  {req.budget && <p className="text-sm font-semibold text-green-600">Budget: N${req.budget.toLocaleString()}</p>}
                  {req.description && <p className="text-sm text-gray-500 mt-2">{req.description}</p>}
                </div>
                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setShowBidForm(true);
                  }}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bid Modal */}
        {showBidForm && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Place Bid for {selectedRequest.request_number}</h2>
              <form onSubmit={submitBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={bidForm.owner_name}
                    onChange={(e) => setBidForm({ ...bidForm, owner_name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={bidForm.owner_phone}
                      onChange={(e) => setBidForm({ ...bidForm, owner_phone: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={bidForm.owner_email}
                      onChange={(e) => setBidForm({ ...bidForm, owner_email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Vehicle *</label>
                  <select
                    required
                    value={bidForm.vehicle_id}
                    onChange={(e) => setBidForm({ ...bidForm, vehicle_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_type} - {v.registration_number} {v.make_model ? `(${v.make_model})` : ""}
                        {v.capacity_kg ? ` - ${v.capacity_kg}kg cap.` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bid Amount (N$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bidForm.bid_amount}
                      onChange={(e) => setBidForm({ ...bidForm, bid_amount: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Days</label>
                    <input
                      type="number"
                      value={bidForm.estimated_days}
                      onChange={(e) => setBidForm({ ...bidForm, estimated_days: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message (optional)</label>
                  <textarea
                    rows={3}
                    value={bidForm.message}
                    onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Additional details about your offer..."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    {submitting ? "Submitting..." : "Submit Bid"}
                  </button>
                  <button type="button" onClick={() => setShowBidForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}