// app/admin/cargo-requests/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type CargoRequest = {
  id: string;
  request_number: string;
  customer_id: string;
  pickup_location: string;
  delivery_location: string;
  weight_kg: number;
  volume_cbm: number;
  transport_mode: string;
  preferred_date: string;
  budget: number;
  description: string;
  status: string;
  assigned_vehicle_id: string;
  created_at: string;
};

export default function CargoRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CargoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<CargoRequest | null>(null);
  const [form, setForm] = useState({
    request_number: "",
    customer_id: "",
    pickup_location: "",
    delivery_location: "",
    weight_kg: "",
    volume_cbm: "",
    transport_mode: "",
    preferred_date: "",
    budget: "",
    description: "",
    status: "pending",
    assigned_vehicle_id: "",
  });

  useEffect(() => {
    checkUser();
    fetchRequests();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cargo_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch: " + error.message);
    else setRequests(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pickup_location || !form.delivery_location) {
      alert("Pickup and delivery locations are required");
      return;
    }
    const payload = {
      request_number: form.request_number || null,
      customer_id: form.customer_id || null,
      pickup_location: form.pickup_location,
      delivery_location: form.delivery_location,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      volume_cbm: form.volume_cbm ? parseFloat(form.volume_cbm) : null,
      transport_mode: form.transport_mode,
      preferred_date: form.preferred_date || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      description: form.description || null,
      status: form.status,
      assigned_vehicle_id: form.assigned_vehicle_id || null,
    };
    if (editingRequest) {
      const { error } = await supabase
        .from("cargo_requests")
        .update(payload)
        .eq("id", editingRequest.id);
      if (error) alert("Update failed: " + error.message);
      else {
        setShowForm(false);
        setEditingRequest(null);
        fetchRequests();
      }
    } else {
      const { error } = await supabase.from("cargo_requests").insert([payload]);
      if (error) alert("Create failed: " + error.message);
      else {
        setShowForm(false);
        resetForm();
        fetchRequests();
      }
    }
  }

  function resetForm() {
    setForm({
      request_number: "",
      customer_id: "",
      pickup_location: "",
      delivery_location: "",
      weight_kg: "",
      volume_cbm: "",
      transport_mode: "",
      preferred_date: "",
      budget: "",
      description: "",
      status: "pending",
      assigned_vehicle_id: "",
    });
  }

  async function deleteRequest(id: string) {
    if (!confirm("Delete this cargo request?")) return;
    const { error } = await supabase.from("cargo_requests").delete().eq("id", id);
    if (error) alert("Delete failed: " + error.message);
    else fetchRequests();
  }

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    assigned: "bg-blue-100 text-blue-700",
    in_transit: "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cargo Requests</h1>
            <p className="text-gray-600">Manage customer cargo requests.</p>
          </div>
          <button
            onClick={() => {
              setEditingRequest(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Request
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingRequest ? "Edit Cargo Request" : "New Cargo Request"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Request Number</label>
                  <input
                    type="text"
                    value={form.request_number}
                    onChange={(e) => setForm({ ...form, request_number: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., CR-2026-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer ID</label>
                  <input
                    type="text"
                    value={form.customer_id}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Location *</label>
                  <input
                    type="text"
                    value={form.pickup_location}
                    onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Location *</label>
                  <input
                    type="text"
                    value={form.delivery_location}
                    onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Volume (cbm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.volume_cbm}
                    onChange={(e) => setForm({ ...form, volume_cbm: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transport Mode</label>
                  <select
                    value={form.transport_mode}
                    onChange={(e) => setForm({ ...form, transport_mode: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="road">Road</option>
                    <option value="air">Air</option>
                    <option value="sea">Sea</option>
                    <option value="rail">Rail</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget (N$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned Vehicle ID</label>
                  <input
                    type="text"
                    value={form.assigned_vehicle_id}
                    onChange={(e) => setForm({ ...form, assigned_vehicle_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                  {editingRequest ? "Save Changes" : "Create Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No cargo requests yet. Click "New Request" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold">
                        {req.request_number || "No number"}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || "bg-gray-100"}`}>
                        {req.status?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {req.pickup_location} → {req.delivery_location}
                    </p>
                    <p className="text-sm text-gray-500">
                      {req.weight_kg ? `${req.weight_kg} kg` : ""} {req.volume_cbm ? `${req.volume_cbm} cbm` : ""} {req.transport_mode ? `· ${req.transport_mode}` : ""}
                    </p>
                    {req.budget && <p className="text-sm">Budget: N${req.budget}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingRequest(req);
                        setForm({
                          request_number: req.request_number || "",
                          customer_id: req.customer_id || "",
                          pickup_location: req.pickup_location,
                          delivery_location: req.delivery_location,
                          weight_kg: req.weight_kg?.toString() || "",
                          volume_cbm: req.volume_cbm?.toString() || "",
                          transport_mode: req.transport_mode || "",
                          preferred_date: req.preferred_date?.split("T")[0] || "",
                          budget: req.budget?.toString() || "",
                          description: req.description || "",
                          status: req.status,
                          assigned_vehicle_id: req.assigned_vehicle_id || "",
                        });
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-gray-100 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}