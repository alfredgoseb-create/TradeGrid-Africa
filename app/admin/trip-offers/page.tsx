// app/admin/trip-offers/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type TripOffer = {
  id: string;
  offer_number: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  notes: string;
  status: string;
  created_at: string;
};

export default function TripOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<TripOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<TripOffer | null>(null);
  const [form, setForm] = useState({
    offer_number: "",
    owner_name: "",
    owner_phone: "",
    owner_email: "",
    origin: "",
    destination: "",
    departure_time: "",
    available_seats: "",
    price_per_seat: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    checkUser();
    fetchOffers();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchOffers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trip_offers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch: " + error.message);
    else setOffers(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.origin || !form.destination) {
      alert("Origin and destination are required");
      return;
    }
    const payload = {
      offer_number: form.offer_number || null,
      owner_name: form.owner_name,
      owner_phone: form.owner_phone,
      owner_email: form.owner_email,
      origin: form.origin,
      destination: form.destination,
      departure_time: form.departure_time || null,
      available_seats: form.available_seats ? parseInt(form.available_seats) : null,
      price_per_seat: form.price_per_seat ? parseFloat(form.price_per_seat) : null,
      notes: form.notes || null,
      status: form.status,
    };
    if (editingOffer) {
      const { error } = await supabase
        .from("trip_offers")
        .update(payload)
        .eq("id", editingOffer.id);
      if (error) alert("Update failed: " + error.message);
      else {
        setShowForm(false);
        setEditingOffer(null);
        fetchOffers();
      }
    } else {
      const { error } = await supabase.from("trip_offers").insert([payload]);
      if (error) alert("Create failed: " + error.message);
      else {
        setShowForm(false);
        resetForm();
        fetchOffers();
      }
    }
  }

  function resetForm() {
    setForm({
      offer_number: "",
      owner_name: "",
      owner_phone: "",
      owner_email: "",
      origin: "",
      destination: "",
      departure_time: "",
      available_seats: "",
      price_per_seat: "",
      notes: "",
      status: "active",
    });
  }

  async function deleteOffer(id: string) {
    if (!confirm("Delete this trip offer?")) return;
    const { error } = await supabase.from("trip_offers").delete().eq("id", id);
    if (error) alert("Delete failed: " + error.message);
    else fetchOffers();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trip Offers</h1>
            <p className="text-gray-600">Manage rides offered by vehicle owners.</p>
          </div>
          <button
            onClick={() => {
              setEditingOffer(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Trip Offer
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingOffer ? "Edit Trip Offer" : "New Trip Offer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Offer Number</label>
                  <input
                    type="text"
                    value={form.offer_number}
                    onChange={(e) => setForm({ ...form, offer_number: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., TO-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name *</label>
                  <input
                    type="text"
                    value={form.owner_name}
                    onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.owner_phone}
                    onChange={(e) => setForm({ ...form, owner_phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={form.owner_email}
                    onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Origin *</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
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
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Departure Time</label>
                  <input
                    type="datetime-local"
                    value={form.departure_time}
                    onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Seats</label>
                  <input
                    type="number"
                    value={form.available_seats}
                    onChange={(e) => setForm({ ...form, available_seats: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Seat (N$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price_per_seat}
                    onChange={(e) => setForm({ ...form, price_per_seat: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Luggage space, meeting point, etc."
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
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                  {editingOffer ? "Save Changes" : "Create Offer"}
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
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No trip offers yet. Click "+ New Trip Offer" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold">
                        {offer.offer_number || "No number"} – {offer.origin} → {offer.destination}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${offer.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {offer.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">Owner: {offer.owner_name}</p>
                    <p className="text-sm text-gray-500">
                      {offer.departure_time && new Date(offer.departure_time).toLocaleString()}
                      {offer.available_seats && ` · ${offer.available_seats} seats`}
                      {offer.price_per_seat && ` · N$${offer.price_per_seat} each`}
                    </p>
                    {offer.notes && <p className="text-sm">{offer.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingOffer(offer);
                        setForm({
                          offer_number: offer.offer_number || "",
                          owner_name: offer.owner_name || "",
                          owner_phone: offer.owner_phone || "",
                          owner_email: offer.owner_email || "",
                          origin: offer.origin,
                          destination: offer.destination,
                          departure_time: offer.departure_time?.slice(0, 16) || "",
                          available_seats: offer.available_seats?.toString() || "",
                          price_per_seat: offer.price_per_seat?.toString() || "",
                          notes: offer.notes || "",
                          status: offer.status,
                        });
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-gray-100 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteOffer(offer.id)}
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