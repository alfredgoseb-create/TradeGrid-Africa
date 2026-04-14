// app/routes/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type TradeRoute = {
  id: string;
  origin_country: string;
  destination_country: string;
  transport_type: string;
  estimated_days: number;
  description: string;
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<TradeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  async function fetchRoutes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trade_routes")
      .select("*")
      .order("origin_country", { ascending: true });
    if (error) {
      console.error(error);
      alert("Failed to fetch routes: " + error.message);
    } else {
      setRoutes(data || []);
    }
    setLoading(false);
  }

  const filteredRoutes = routes.filter(route => {
    if (searchOrigin && !route.origin_country.toLowerCase().includes(searchOrigin.toLowerCase())) return false;
    if (searchDest && !route.destination_country.toLowerCase().includes(searchDest.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </h1>
          <div className="flex gap-4">
            <Link href="/routes" className="text-sm text-blue-600 hover:underline">
              Trade Routes
            </Link>
            <Link href="/store" className="text-sm text-gray-600 hover:text-gray-900">
              Store
            </Link>
            <Link href="/order-status" className="text-sm text-gray-600 hover:text-gray-900">
              Track Order
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Trade Routes</h1>
        <p className="text-gray-600 mb-6">Explore shipping routes across Southern Africa.</p>

        <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="From (origin country)"
            value={searchOrigin}
            onChange={(e) => setSearchOrigin(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="To (destination country)"
            value={searchDest}
            onChange={(e) => setSearchDest(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            onClick={() => { setSearchOrigin(""); setSearchDest(""); }}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        </div>

        {loading ? (
          <p>Loading routes...</p>
        ) : filteredRoutes.length === 0 ? (
          <p className="text-gray-500">No routes match your criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => (
              <div key={route.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold">{route.origin_country} → {route.destination_country}</h3>
                {route.transport_type && <p className="text-sm text-gray-600 mt-1">🚚 {route.transport_type}</p>}
                <div className="mt-4 space-y-2 text-sm">
                  {route.estimated_days && <p>⏱️ Estimated transit: {route.estimated_days} days</p>}
                  {route.description && <p className="text-gray-500 text-xs mt-2">{route.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} NamLogix Africa – Connecting Southern African Trade
        </div>
      </footer>
    </div>
  );
}