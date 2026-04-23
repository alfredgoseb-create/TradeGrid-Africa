// app/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function HomePage() {
  // Fetch latest cargo requests (pending)
  const { data: cargoRequests } = await supabase
    .from("cargo_requests")
    .select("id, request_number, pickup_location, delivery_location, weight_kg, budget, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch latest trip offers (active)
  const { data: tripOffers } = await supabase
    .from("trip_offers")
    .select("id, offer_number, origin, destination, available_seats, price_per_seat, departure_time")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">NamLogix Trading Hub</h1>
        <p className="text-gray-600 mb-8">Connect shippers with carriers – post cargo, find trips, move goods.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column: Cargo Requests */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📦 Available Cargo</h2>
              <Link href="/cargo-requests" className="text-blue-600 text-sm">View all →</Link>
            </div>
            {cargoRequests?.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4 text-gray-500">No cargo requests yet. Be the first to post!</div>
            ) : (
              <div className="space-y-3">
                {cargoRequests?.map((req) => (
                  <div key={req.id} className="bg-white rounded-lg shadow p-4">
                    <div className="font-medium">{req.request_number || "Cargo"}</div>
                    <div className="text-sm">{req.pickup_location} → {req.delivery_location}</div>
                    <div className="text-sm text-gray-500">{req.weight_kg ? `${req.weight_kg} kg` : ""} · Budget: N${req.budget ?? "?"}</div>
                    <Link href={`/cargo-requests/${req.id}`} className="text-blue-600 text-sm mt-2 inline-block">View & bid →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: Trip Offers */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🚛 Available Trips</h2>
              <Link href="/trip-offers" className="text-blue-600 text-sm">View all →</Link>
            </div>
            {tripOffers?.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4 text-gray-500">No trip offers yet. Offer a ride!</div>
            ) : (
              <div className="space-y-3">
                {tripOffers?.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-lg shadow p-4">
                    <div className="font-medium">{offer.offer_number || "Trip"}</div>
                    <div className="text-sm">{offer.origin} → {offer.destination}</div>
                    <div className="text-sm text-gray-500">{offer.available_seats} seats · N${offer.price_per_seat} each</div>
                    <Link href={`/trip-offers/${offer.id}`} className="text-blue-600 text-sm mt-2 inline-block">View & book →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/post" className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block">
            + Post new cargo or trip
          </Link>
        </div>
      </div>
    </div>
  );
}