"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type TripOffer = {
  id: string;
  offer_number: string;
  vehicle_id: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  notes: string;
  vehicle?: { registration_number: string; make_model: string; vehicle_type: string };
};

export default function TripOffersPage() {
  const [offers, setOffers] = useState<TripOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<TripOffer | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    passenger_name: "",
    passenger_phone: "",
    passenger_email: "",
    seats_booked: 1,
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trip_offers")
      .select(`*, vehicles(registration_number, make_model, vehicle_type)`)
      .eq("status", "active")
      .order("departure_time", { ascending: true });
    if (error) console.error(error);
    else setOffers(data || []);
    setLoading(false);
  }

  async function bookTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOffer) return;
    if (!bookingForm.passenger_name || bookingForm.seats_booked < 1) {
      alert("Please fill in your name and number of seats");
      return;
    }
    if (bookingForm.seats_booked > selectedOffer.available_seats) {
      alert(`Only ${selectedOffer.available_seats} seats available`);
      return;
    }

    setSubmitting(true);
    const total = bookingForm.seats_booked * selectedOffer.price_per_seat;

    const { error } = await supabase.from("trip_bookings").insert([{
      trip_offer_id: selectedOffer.id,
      passenger_name: bookingForm.passenger_name,
      passenger_phone: bookingForm.passenger_phone || null,
      passenger_email: bookingForm.passenger_email || null,
      seats_booked: bookingForm.seats_booked,
      total_amount: total,
      status: "pending",
    }]);

    if (error) alert("Booking failed: " + error.message);
    else {
      // Update available seats
      await supabase
        .from("trip_offers")
        .update({ available_seats: selectedOffer.available_seats - bookingForm.seats_booked })
        .eq("id", selectedOffer.id);
      setSuccess(true);
      setShowBookingForm(false);
      fetchOffers();
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b"><div className="max-w-4xl mx-auto px-4 py-4"><h1 className="text-2xl font-bold">NamLogix <span className="text-blue-600">AFRICA</span></h1></div></header>
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Booking Request Sent!</h2>
            <p className="text-gray-600 mb-6">The vehicle owner will confirm your booking shortly.</p>
            <Link href="/trip-offers" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Browse More Trips</Link>
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
            <Link href="/request-ride" className="text-sm text-gray-600 hover:text-gray-900">Request a Ride</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Available Rides</h1>
        <p className="text-gray-600 mb-8">Find and book seats on vehicles traveling your way.</p>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">No available rides at the moment. Check back later or <Link href="/request-ride" className="text-blue-600">request a ride</Link>.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{offer.origin} → {offer.destination}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{offer.available_seats} seats</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <p>🚗 {offer.vehicle?.vehicle_type} {offer.vehicle?.registration_number} {offer.vehicle?.make_model}</p>
                  <p>👤 Owner: {offer.owner_name}</p>
                  <p>⏰ {offer.departure_time ? new Date(offer.departure_time).toLocaleString() : "Flexible"}</p>
                  <p className="font-semibold text-green-600">N${offer.price_per_seat.toLocaleString()} per seat</p>
                  {offer.notes && <p className="text-gray-500 text-xs mt-2">{offer.notes}</p>}
                </div>
                <button onClick={() => { setSelectedOffer(offer); setBookingForm({ passenger_name: "", passenger_phone: "", passenger_email: "", seats_booked: 1 }); setShowBookingForm(true); }} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Book Now</button>
              </div>
            ))}
          </div>
        )}

        {showBookingForm && selectedOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Book {selectedOffer.origin} → {selectedOffer.destination}</h2>
              <form onSubmit={bookTrip} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Your Name *</label><input type="text" required value={bookingForm.passenger_name} onChange={(e) => setBookingForm({ ...bookingForm, passenger_name: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={bookingForm.passenger_phone} onChange={(e) => setBookingForm({ ...bookingForm, passenger_phone: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={bookingForm.passenger_email} onChange={(e) => setBookingForm({ ...bookingForm, passenger_email: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Seats * (max {selectedOffer.available_seats})</label><input type="number" min="1" max={selectedOffer.available_seats} value={bookingForm.seats_booked} onChange={(e) => setBookingForm({ ...bookingForm, seats_booked: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2" /></div>
                <p className="text-sm">Total: N${(bookingForm.seats_booked * selectedOffer.price_per_seat).toLocaleString()}</p>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">{submitting ? "Booking..." : "Confirm Booking"}</button>
                  <button type="button" onClick={() => setShowBookingForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}