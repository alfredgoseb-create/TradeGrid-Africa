"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Vehicle = {
  id: string;
  vehicle_type: string;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  capacity_kg: number;
  capacity_pax: number;
  registration_number: string;
  license_plate: string;
  make_model: string;
  year: number;
  fuel_type: string;
  current_location: string;
  hourly_rate: number;
  daily_rate: number;
  last_maintenance: string;
  is_available: boolean;
  image_url: string;
  notes: string;
  created_at: string;
};

const vehicleTypes = [
  { value: "truck", label: "🚛 Truck", icon: "🚛", capacityHint: "Capacity (kg)" },
  { value: "van", label: "🚐 Van", icon: "🚐", capacityHint: "Capacity (kg)" },
  { value: "plane", label: "✈️ Plane", icon: "✈️", capacityHint: "Cargo (kg) / Passengers" },
  { value: "ship", label: "🚢 Ship", icon: "🚢", capacityHint: "Cargo (kg) / Passengers" },
  { value: "train", label: "🚂 Train", icon: "🚂", capacityHint: "Cargo (kg) / Passengers" },
  { value: "bus", label: "🚌 Bus", icon: "🚌", capacityHint: "Passengers" },
];

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({
    vehicle_type: "truck",
    owner_name: "",
    owner_phone: "",
    owner_email: "",
    capacity_kg: "",
    capacity_pax: "",
    registration_number: "",
    license_plate: "",
    make_model: "",
    year: "",
    fuel_type: "",
    current_location: "",
    hourly_rate: "",
    daily_rate: "",
    last_maintenance: "",
    is_available: true,
    image_url: "",
    notes: "",
  });

  useEffect(() => {
    checkUser();
    fetchVehicles();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchVehicles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch vehicles: " + error.message);
    else setVehicles(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.owner_name || !form.registration_number) {
      alert("Owner name and registration number are required");
      return;
    }

    const payload = {
      vehicle_type: form.vehicle_type,
      owner_name: form.owner_name,
      owner_phone: form.owner_phone || null,
      owner_email: form.owner_email || null,
      capacity_kg: form.capacity_kg ? parseInt(form.capacity_kg) : null,
      capacity_pax: form.capacity_pax ? parseInt(form.capacity_pax) : null,
      registration_number: form.registration_number,
      license_plate: form.license_plate || null,
      make_model: form.make_model || null,
      year: form.year ? parseInt(form.year) : null,
      fuel_type: form.fuel_type || null,
      current_location: form.current_location || null,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : null,
      last_maintenance: form.last_maintenance || null,
      is_available: form.is_available,
      image_url: form.image_url || null,
      notes: form.notes || null,
    };

    if (editing) {
      const { error } = await supabase
        .from("vehicles")
        .update(payload)
        .eq("id", editing.id);
      if (error) alert("Failed to update: " + error.message);
      else {
        setShowForm(false);
        setEditing(null);
        fetchVehicles();
      }
    } else {
      const { error } = await supabase.from("vehicles").insert([payload]);
      if (error) alert("Failed to create: " + error.message);
      else {
        setShowForm(false);
        resetForm();
        fetchVehicles();
      }
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    const { error } = await supabase
      .from("vehicles")
      .update({ is_available: !current })
      .eq("id", id);
    if (error) alert("Failed to update: " + error.message);
    else fetchVehicles();
  }

  async function deleteVehicle(id: string) {
    if (!confirm("Delete this vehicle? This will remove all associated bids and trips.")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchVehicles();
  }

  function resetForm() {
    setForm({
      vehicle_type: "truck",
      owner_name: "",
      owner_phone: "",
      owner_email: "",
      capacity_kg: "",
      capacity_pax: "",
      registration_number: "",
      license_plate: "",
      make_model: "",
      year: "",
      fuel_type: "",
      current_location: "",
      hourly_rate: "",
      daily_rate: "",
      last_maintenance: "",
      is_available: true,
      image_url: "",
      notes: "",
    });
  }

  const filteredVehicles = filterType === "all" 
    ? vehicles 
    : vehicles.filter(v => v.vehicle_type === filterType);

  const getTypeIcon = (type: string) => {
    return vehicleTypes.find(t => t.value === type)?.icon || "🚛";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vehicles</h1>
            <p className="text-gray-600">Manage trucks, planes, ships, trains, and buses for cargo & passenger transport.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Register Vehicle
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
          >
            All ({vehicles.length})
          </button>
          {vehicleTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === type.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              {type.icon} {type.label} ({vehicles.filter(v => v.vehicle_type === type.value).length})
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No vehicles registered. Click "Register Vehicle" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(vehicle.vehicle_type)}</span>
                    <span className="font-semibold text-gray-700 uppercase text-sm">{vehicle.vehicle_type}</span>
                  </div>
                  <button
                    onClick={() => toggleAvailability(vehicle.id, vehicle.is_available)}
                    className={`px-2 py-1 text-xs rounded-full ${vehicle.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {vehicle.is_available ? "Available" : "Unavailable"}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{vehicle.make_model || vehicle.registration_number}</h3>
                  <p className="text-sm text-gray-500">Reg: {vehicle.registration_number}</p>
                  {vehicle.license_plate && <p className="text-sm text-gray-500">Plate: {vehicle.license_plate}</p>}
                  <p className="text-sm mt-2"><span className="font-medium">Owner:</span> {vehicle.owner_name}</p>
                  {vehicle.owner_phone && <p className="text-sm"><span className="font-medium">Phone:</span> {vehicle.owner_phone}</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {vehicle.capacity_kg && <span className="bg-gray-100 px-2 py-1 rounded">📦 {vehicle.capacity_kg.toLocaleString()} kg</span>}
                    {vehicle.capacity_pax && <span className="bg-gray-100 px-2 py-1 rounded">👥 {vehicle.capacity_pax} pax</span>}
                    {vehicle.current_location && <span className="bg-gray-100 px-2 py-1 rounded">📍 {vehicle.current_location}</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {vehicle.hourly_rate && <span className="text-sm font-semibold text-green-600">N${vehicle.hourly_rate}/hr</span>}
                    {vehicle.daily_rate && <span className="text-sm font-semibold text-green-600">N${vehicle.daily_rate}/day</span>}
                  </div>
                  {vehicle.notes && <p className="text-xs text-gray-400 mt-2 truncate">{vehicle.notes}</p>}
                </div>
                <div className="border-t p-3 flex justify-end gap-2 bg-gray-50">
                  <button
                    onClick={() => {
                      setEditing(vehicle);
                      setForm({
                        vehicle_type: vehicle.vehicle_type,
                        owner_name: vehicle.owner_name || "",
                        owner_phone: vehicle.owner_phone || "",
                        owner_email: vehicle.owner_email || "",
                        capacity_kg: vehicle.capacity_kg?.toString() || "",
                        capacity_pax: vehicle.capacity_pax?.toString() || "",
                        registration_number: vehicle.registration_number || "",
                        license_plate: vehicle.license_plate || "",
                        make_model: vehicle.make_model || "",
                        year: vehicle.year?.toString() || "",
                        fuel_type: vehicle.fuel_type || "",
                        current_location: vehicle.current_location || "",
                        hourly_rate: vehicle.hourly_rate?.toString() || "",
                        daily_rate: vehicle.daily_rate?.toString() || "",
                        last_maintenance: vehicle.last_maintenance || "",
                        is_available: vehicle.is_available,
                        image_url: vehicle.image_url || "",
                        notes: vehicle.notes || "",
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteVehicle(vehicle.id)} className="text-red-600 hover:text-red-800 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editing ? "Edit Vehicle" : "Register New Vehicle"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vehicle Type *</label>
                    <select
                      value={form.vehicle_type}
                      onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      {vehicleTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Registration Number *</label>
                    <input type="text" value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} className="w-full border rounded px-3 py-2" required />
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Owner Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Owner Name *</label>
                      <input type="text" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input type="tel" value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Make/Model</label>
                      <input type="text" value={form.make_model} onChange={(e) => setForm({ ...form, make_model: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="e.g., Mercedes Actros" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Year</label>
                      <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">License Plate</label>
                      <input type="text" value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fuel Type</label>
                      <input type="text" value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Diesel, Petrol, Electric" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Capacity & Rates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cargo Capacity (kg)</label>
                      <input type="number" value={form.capacity_kg} onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Passenger Capacity</label>
                      <input type="number" value={form.capacity_pax} onChange={(e) => setForm({ ...form, capacity_pax: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hourly Rate (N$)</label>
                      <input type="number" step="0.01" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Daily Rate (N$)</label>
                      <input type="number" step="0.01" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Location</label>
                      <input type="text" value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="City, Country" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Maintenance</label>
                      <input type="date" value={form.last_maintenance} onChange={(e) => setForm({ ...form, last_maintenance: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Additional info..." />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="rounded" />
                      Available for hire
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    {editing ? "Save Changes" : "Register Vehicle"}
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