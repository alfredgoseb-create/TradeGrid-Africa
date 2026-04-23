// app/trade-routes/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TradeRoute = {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_days: number;
  popular_goods: string;
};

export default function TradeRoutesPage() {
  const [routes, setRoutes] = useState<TradeRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  async function fetchRoutes() {
    const { data, error } = await supabase.from("trade_routes").select("*");
    if (error) alert(error.message);
    else setRoutes(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📊 Trade Routes</h1>
        {loading && <p>Loading...</p>}
        {!loading && routes.length === 0 && <div className="bg-white rounded-lg shadow p-6 text-center">No trade routes defined yet.</div>}
        <div className="grid md:grid-cols-2 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold">{route.origin} → {route.destination}</h2>
              <p className="text-sm text-gray-500">{route.distance_km} km · ~{route.estimated_days} days</p>
              <p className="text-sm mt-2">Popular goods: {route.popular_goods}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}