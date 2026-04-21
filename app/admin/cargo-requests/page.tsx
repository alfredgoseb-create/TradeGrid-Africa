"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type CargoRequest = {
  id: string;
  request_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
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
  vehicle_name?: string;
  created_at: string;
  updated_at: string;
};

type Vehicle = {
  id: string;
  registration_number: string;
  make_model: string;
  vehicle_type: string;
  is_available: boolean;
};

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const transportModes = [
  { value: "road", label: "🚛 Road" },
  { value: "rail", label: "🚂 Rail" },
  { value: "air", label: "✈️ Air" },
  { value: "sea", label: "🚢 Sea" },
  { value: "any", label: "🌍 Any" },
];

export default function CargoRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CargoRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CargoRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
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
    // Fetch cargo requests with assigned vehicle info
    const { data: requestsData, error: reqError } = await supabase
      .from("cargo_requests")
      .select(`*, vehicles(registration_number, make_model, vehicle_type)`)
      .order("created_at", { ascending: false });
    
    if (reqError) alert("Failed to fetch requests: " + reqError.message);
    else {
      const mapped = (requestsData || []).map((r: any) => ({
        ...r,
        vehicle_name: r.vehicles ? `${r.vehicles.vehicle_type} ${r.vehicles.registration_number}` : null,
      }));
      setRequests(mapped);
    }

    // Fetch available vehicles for assignment
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("id, registration_number, make_model, vehicle_type, is_available")
      .eq("is_available", true);
    setVehicles(vehiclesData || []);

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_name || !form.pickup_location || !form.delivery_location) {
      alert("Customer name, pickup, and delivery locations are required");
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

    if (editing) {
      const { error } = await supabase
        .from("cargo_requests")
        .update(payload)
        .eq("id", editing.id);
      if (error) alert("Failed to update: " + error.message);
      else {
        setShowForm(false);
        setEditing(null);
        fetchData();
      }
    } else {
      const { error } = await supabase.from("cargo_requests").insert([payload]);
      if (error) alert("Failed to create: " + error.message);
      else {
        setShowForm(false);
        resetForm();
        fetchData();
      }
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("cargo_requests")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) alert("Failed to update status: " + error.message);
    else fetchData();
  }

  async function assignVehicle(id: string, vehicleId: string) {
    const { error } = await supabase
      .from("cargo_requests")
      .update({ assigned_vehicle_id: vehicleId || null, status: vehicleId ? "assigned" : "open" })
      .eq("id", id);
    if (error) alert("Failed to assign vehicle: " + error.message);
    else fetchData();
  }

  async function deleteRequest(id: string) {
    if (!confirm("Delete this cargo request?")) return;
    const { error } = await supabase.from("cargo_requests").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchData();
  }

  function resetForm() {
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

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (modeFilter !== "all" && r.transport_mode !== modeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cargo Requests</h1>
            <p className="text-gray-600">Manage customer cargo shipping requests.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Cargo Request
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Transport Modes</option>
            {transportModes.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button
            onClick={() => { setStatusFilter("all"); setModeFilter("all"); }}
            className="px-3 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No cargo requests found. Click "New Cargo Request" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{req.request_number}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[req.status]}`}>
                        {req.status.toUpperCase()}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {transportModes.find(m => m.value === req.transport_mode)?.label || req.transport_mode}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={req.assigned_vehicle_id || ""}
                      onChange={(e) => assignVehicle(req.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.vehicle_type} - {v.registration_number}
                        </option>
                      ))}
                    </select>
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditing(req);
                        setForm({
                          customer_name: req.customer_name,
                          customer_phone: req.customer_phone || "",
                          customer_email: req.customer_email || "",
                          pickup_location: req.pickup_location,
                          delivery_location: req.delivery_location,
                          weight_kg: req.weight_kg?.toString() || "",
                          volume_cbm: req.volume_cbm?.toString() || "",
                          transport_mode: req.transport_mode,
                          preferred_date: req.preferred_date || "",
                          budget: req.budget?.toString() || "",
                          description: req.description || "",
                        });
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteRequest(req.id)} className="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{req.customer_name}</p>
                    {req.customer_phone && <p className="text-sm">{req.customer_phone}</p>}
                    {req.customer_email && <p className="text-sm text-gray-500">{req.customer_email}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="font-medium">📍 {req.pickup_location} → 📍 {req.delivery_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cargo Details</p>
                    <div className="flex gap-3 text-sm">
                      {req.weight_kg && <span>📦 {req.weight_kg.toLocaleString()} kg</span>}
                      {req.volume_cbm && <span>📐 {req.volume_cbm} m³</span>}
                      {req.budget && <span className="font-semibold text-green-600">N${req.budget.toLocaleString()}</span>}
                    </div>
                    {req.preferred_date && <p className="text-sm text-gray-500 mt-1">Preferred: {new Date(req.preferred_date).toLocaleDateString()}</p>}
                  </div>
                  <div>
                    {req.assigned_vehicle_id && (
                      <>
                        <p className="text-sm text-gray-500">Assigned Vehicle</p>
                        <p className="text-sm">{req.vehicle_name || "Vehicle info"}</p>
                      </>
                    )}
                  </div>
                </div>
                {req.description && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {req.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editing ? "Edit Cargo Request" : "New Cargo Request"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name *</label>
                  <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pickup Location *</label>
                    <input type="text" value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Location *</label>
                    <input type="text" value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })} className="w-full border rounded px-3 py-2" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Volume (m³)</label>
                    <input type="number" step="0.01" value={form.volume_cbm} onChange={(e) => setForm({ ...form, volume_cbm: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Transport Mode</label>
                    <select value={form.transport_mode} onChange={(e) => setForm({ ...form, transport_mode: e.target.value })} className="w-full border rounded px-3 py-2">
                      {transportModes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Budget (N$)</label>
                    <input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Cargo details, special instructions..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    {editing ? "Save Changes" : "Create Request"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}