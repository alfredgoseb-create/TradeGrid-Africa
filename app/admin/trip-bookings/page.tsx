"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Booking = {
  id: string;
  booking_number: string;
  trip_offer_id: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  seats_booked: number;
  total_amount: number;
  status: string;
  created_at: string;
  trip_offer?: { origin: string; destination: string; departure_time: string };
};

export default function AdminTripBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkUser(); fetchBookings(); }, []);

  async function checkUser() { const { data } = await supabase.auth.getUser(); if (!data.user) router.push("/login"); }

  async function fetchBookings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trip_bookings")
      .select(`*, trip_offers(origin, destination, departure_time)`)
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch bookings: " + error.message);
    else setBookings(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from("trip_bookings").update({ status: newStatus }).eq("id", id);
    if (error) alert("Failed to update: " + error.message);
    else fetchBookings();
  }

  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("trip_bookings").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchBookings();
  }

  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Trip Bookings</h1>
        <p className="text-gray-600 mb-8">Manage passenger bookings for trip offers.</p>
        {loading ? <p>Loading...</p> : bookings.length === 0 ? <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">No bookings yet.</div> : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div><div className="flex items-center gap-3"><h3 className="font-semibold">{booking.booking_number}</h3><span className={`px-2 py-1 text-xs rounded-full ${statusColors[booking.status] || "bg-gray-100"}`}>{booking.status.toUpperCase()}</span></div>
                    <p className="text-sm text-gray-500 mt-1">Booked: {new Date(booking.created_at).toLocaleDateString()}</p></div>
                  <div className="flex gap-2"><select value={booking.status} onChange={(e) => updateStatus(booking.id, e.target.value)} className="border rounded px-2 py-1 text-sm"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select><button onClick={() => deleteBooking(booking.id)} className="text-red-600 hover:text-red-800">Delete</button></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div><p className="text-sm text-gray-500">Passenger</p><p className="font-medium">{booking.passenger_name}</p>{booking.passenger_phone && <p className="text-sm">📞 {booking.passenger_phone}</p>}{booking.passenger_email && <p className="text-sm">✉️ {booking.passenger_email}</p>}</div>
                  <div><p className="text-sm text-gray-500">Trip</p><p>{booking.trip_offer?.origin} → {booking.trip_offer?.destination}</p><p className="text-sm">⏰ {booking.trip_offer?.departure_time ? new Date(booking.trip_offer.departure_time).toLocaleString() : "Flexible"}</p></div>
                  <div><p className="text-sm text-gray-500">Booking Details</p><p>👥 {booking.seats_booked} seats</p><p className="font-semibold text-green-600">N${booking.total_amount?.toLocaleString()}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}