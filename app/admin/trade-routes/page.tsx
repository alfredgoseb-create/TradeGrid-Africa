// app/admin/trade-routes/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type TradeRoute = {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  estimated_days: number;
  cost: number;
  distance_km: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function TradeRoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<TradeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TradeRoute | null>(null);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    carrier: "",
    estimated_days: "",
    cost: "",
    distance_km: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    checkUser();
    fetchRoutes();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchRoutes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trade_routes")
      .select("*")
      .order("origin", { ascending: true });
    if (error) {
      alert("Failed to fetch routes: " + error.message);
      console.error(error);
    } else {
      setRoutes(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.origin || !form.destination) {
      alert("Origin and destination are required");
      return;
    }
    const payload = {
      origin: form.origin,
      destination: form.destination,
      carrier: form.carrier || null,
      estimated_days: form.estimated_days ? parseInt(form.estimated_days) : null,
      cost: form.cost ? parseFloat(form.cost) : null,
      distance_km: form.distance_km ? parseInt(form.distance_km) : null,
      description: form.description || null,
      is_active: form.is_active,
    };
    if (editingRoute) {
      const { error } = await supabase
        .from("trade_routes")
        .update(payload)
        .eq("id", editingRoute.id);
      if (error) alert("Failed to update: " + error.message);
      else {
        setShowForm(false);
        setEditingRoute(null);
        fetchRoutes();
      }
    } else {
      const { error } = await supabase.from("trade_routes").insert([payload]);
      if (error) alert("Failed to create: " + error.message);
      else {
        setShowForm(false);
        setForm({
          origin: "",
          destination: "",
          carrier: "",
          estimated_days: "",
          cost: "",
          distance_km: "",
          description: "",
          is_active: true,
        });
        fetchRoutes();
      }
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    const { error } = await supabase
      .from("trade_routes")
      .update({ is_active: !currentActive })
      .eq("id", id);
    if (error) alert("Failed to update status: " + error.message);
    else fetchRoutes();
  }

  async function deleteRoute(id: string) {
    if (!confirm("Delete this trade route?")) return;
    const { error } = await supabase.from("trade_routes").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchRoutes();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trade Routes</h1>
            <p className="text-gray-600">Manage shipping routes, carriers, and transit times.</p>
          </div>
          <button
            onClick={() => {
              setEditingRoute(null);
              setForm({
                origin: "",
                destination: "",
                carrier: "",
                estimated_days: "",
                cost: "",
                distance_km: "",
                description: "",
                is_active: true,
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Route
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No trade routes defined. Click "New Route" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (N$)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance (km)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.origin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.destination}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.carrier || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.estimated_days || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.cost ? `N$${route.cost}` : "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.distance_km || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(route.id, route.is_active)}
                          className={`px-2 py-1 text-xs rounded-full ${route.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {route.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingRoute(route);
                            setForm({
                              origin: route.origin,
                              destination: route.destination,
                              carrier: route.carrier || "",
                              estimated_days: route.estimated_days?.toString() || "",
                              cost: route.cost?.toString() || "",
                              distance_km: route.distance_km?.toString() || "",
                              description: route.description || "",
                              is_active: route.is_active,
                            });
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRoute(route.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingRoute ? "Edit Trade Route" : "New Trade Route"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Origin *</label>
                    <input
                      type="text"
                      value={form.origin}
                      onChange={(e) => setForm({ ...form, origin: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                      placeholder="e.g., Walvis Bay"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination *</label>
                    <input
                      type="text"
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                      placeholder="e.g., Durban"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Carrier</label>
                  <input
                    type="text"
                    value={form.carrier}
                    onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., NamPost, DHL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Days</label>
                    <input
                      type="number"
                      value={form.estimated_days}
                      onChange={(e) => setForm({ ...form, estimated_days: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost (N$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="1500.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={form.distance_km}
                    onChange={(e) => setForm({ ...form, distance_km: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Additional details..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="rounded"
                    />
                    Active (visible to customers)
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    {editingRoute ? "Save Changes" : "Create Route"}
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
          </div>
        )}
      </div>
    </div>
  );
}