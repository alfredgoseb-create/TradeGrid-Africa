// app/cargo-requests/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type CargoRequest = {
  id: string;
  request_number: string;
  pickup_location: string;
  delivery_location: string;
  weight_kg: number;
  budget: number;
  transport_mode: string;
  status: string;
  created_at: string;
};

export default function CargoRequestsPage() {
  const [requests, setRequests] = useState<CargoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [filterMode]);

  async function fetchRequests() {
    setLoading(true);
    let query = supabase
      .from("cargo_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (filterMode) query = query.eq("transport_mode", filterMode);
    const { data, error } = await query;
    if (error) console.error(error);
    else setRequests(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📦 Cargo Requests</h1>
          <Link href="/post" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Post Cargo</Link>
        </div>
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <select
            className="border rounded px-3 py-2"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="">All transport modes</option>
            <option value="road">Road</option>
            <option value="air">Air</option>
            <option value="sea">Sea</option>
            <option value="rail">Rail</option>
          </select>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">No cargo requests yet.</div>
        )}
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{req.request_number || "Cargo"}</h2>
                  <p className="text-gray-600">{req.pickup_location} → {req.delivery_location}</p>
                  <p className="text-sm text-gray-500">{req.weight_kg} kg · {req.transport_mode} · Budget: N${req.budget}</p>
                </div>
                <Link href={`/cargo-requests/${req.id}`} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">View & Bid</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}