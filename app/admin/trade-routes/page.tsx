// app/admin/trade-routes/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type TradeRoute = {
  id: string;
  origin_country: string;
  destination_country: string;
  transport_type: string;
  estimated_days: number;
  description: string;
  created_at: string;
};

export default function TradeRoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<TradeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TradeRoute | null>(null);
  const [form, setForm] = useState({
    origin_country: "",
    destination_country: "",
    transport_type: "",
    estimated_days: "",
    description: "",
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
      .order("origin_country", { ascending: true });
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
    if (!form.origin_country || !form.destination_country) {
      alert("Origin and destination are required");
      return;
    }
    const payload = {
      origin_country: form.origin_country,
      destination_country: form.destination_country,
      transport_type: form.transport_type || null,
      estimated_days: form.estimated_days ? parseInt(form.estimated_days) : null,
      description: form.description || null,
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
          origin_country: "",
          destination_country: "",
          transport_type: "",
          estimated_days: "",
          description: "",
        });
        fetchRoutes();
      }
    }
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
            <p className="text-gray-600">Manage shipping routes, transport types, and transit times.</p>
          </div>
          <button
            onClick={() => {
              setEditingRoute(null);
              setForm({
                origin_country: "",
                destination_country: "",
                transport_type: "",
                estimated_days: "",
                description: "",
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.origin_country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.destination_country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.transport_type || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.estimated_days || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{route.description || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingRoute(route);
                          setForm({
                            origin_country: route.origin_country,
                            destination_country: route.destination_country,
                            transport_type: route.transport_type || "",
                            estimated_days: route.estimated_days?.toString() || "",
                            description: route.description || "",
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
                    <label className="block text-sm font-medium mb-1">Origin Country *</label>
                    <input
                      type="text"
                      value={form.origin_country}
                      onChange={(e) => setForm({ ...form, origin_country: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                      placeholder="e.g., Namibia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination Country *</label>
                    <input
                      type="text"
                      value={form.destination_country}
                      onChange={(e) => setForm({ ...form, destination_country: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                      placeholder="e.g., South Africa"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transport Type</label>
                  <input
                    type="text"
                    value={form.transport_type}
                    onChange={(e) => setForm({ ...form, transport_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Road, Rail, Air, Sea"
                  />
                </div>
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
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Additional details about this route..."
                  />
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