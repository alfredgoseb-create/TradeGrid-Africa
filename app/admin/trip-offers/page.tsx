"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function TripOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    owner_name: "",
    owner_phone: "",
    owner_email: "",
    origin: "",
    destination: "",
    departure_time: "",
    available_seats: "1",
    price_per_seat: "",
    notes: "",
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
    if (error) console.error(error);
    else setOffers(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.price_per_seat) {
      alert("Origin, destination, and price are required");
      return;
    }
    const { error } = await supabase.from("trip_offers").insert([
      {
        owner_name: form.owner_name,
        owner_phone: form.owner_phone || null,
        owner_email: form.owner_email || null,
        origin: form.origin,
        destination: form.destination,
        departure_time: form.departure_time || null,
        available_seats: parseInt(form.available_seats),
        price_per_seat: parseFloat(form.price_per_seat),
        notes: form.notes || null,
        status: "active",
      },
    ]);
    if (error) alert("Failed to create: " + error.message);
    else {
      setShowForm(false);
      setForm({
        owner_name: "",
        owner_phone: "",
        owner_email: "",
        origin: "",
        destination: "",
        departure_time: "",
        available_seats: "1",
        price_per_seat: "",
        notes: "",
      });
      fetchOffers();
    }
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
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? "Cancel" : "+ New Trip Offer"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Trip Offer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={form.owner_name}
                    onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.owner_phone}
                    onChange={(e) => setForm({ ...form, owner_phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Origin *</label>
                  <input
                    type="text"
                    required
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departure Time</label>
                <input
                  type="datetime-local"
                  value={form.departure_time}
                  onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Available Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={form.available_seats}
                    onChange={(e) => setForm({ ...form, available_seats: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Seat (N$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price_per_seat}
                    onChange={(e) => setForm({ ...form, price_per_seat: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Luggage space, meeting point, etc."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                  Create Offer
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {offer.origin} → {offer.destination}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {offer.owner_name} • {offer.available_seats} seats • N${offer.price_per_seat}/seat
                    </p>
                    {offer.departure_time && (
                      <p className="text-xs text-gray-400">
                        Departs: {new Date(offer.departure_time).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const newStatus =
                          offer.status === "active" ? "cancelled" : "active";
                        await supabase
                          .from("trip_offers")
                          .update({ status: newStatus })
                          .eq("id", offer.id);
                        fetchOffers();
                      }}
                      className={`px-2 py-1 text-xs rounded-full ${
                        offer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {offer.status === "active" ? "Active" : "Cancelled"}
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Delete this offer?")) {
                          await supabase.from("trip_offers").delete().eq("id", offer.id);
                          fetchOffers();
                        }
                      }}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {offer.notes && <p className="text-sm text-gray-500 mt-2">{offer.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}