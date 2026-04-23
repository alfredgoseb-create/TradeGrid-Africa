// app/bids/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Bid = {
  id: string;
  cargo_request_id: string;
  carrier_name: string;
  bid_amount: number;
  status: string;
  created_at: string;
  cargo_request?: {
    request_number: string;
    pickup_location: string;
    delivery_location: string;
    weight_kg: number;
    budget: number;
  };
};

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBids();
  }, [statusFilter]);

  async function fetchBids() {
    setLoading(true);
    let query = supabase
      .from("bids")
      .select(`
        *,
        cargo_request:cargo_requests(
          request_number,
          pickup_location,
          delivery_location,
          weight_kg,
          budget
        )
      `)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching bids:", error);
      alert("Failed to load bids: " + error.message);
    } else {
      setBids(data || []);
    }
    setLoading(false);
  }

  async function updateBidStatus(bidId: string, newStatus: string) {
    const { error } = await supabase
      .from("bids")
      .update({ status: newStatus })
      .eq("id", bidId);
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      fetchBids(); // refresh list
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">💰 All Bids</h1>
          <Link href="/post" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + Post Cargo / Trip
          </Link>
        </div>

        {/* Filter by status */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-center">
          <span className="text-sm font-medium">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && bids.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No bids found. Be the first to place a bid on a cargo request!
          </div>
        )}

        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h2 className="text-xl font-semibold">
                      {bid.cargo_request?.request_number || "Cargo Request"}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bid.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      bid.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {bid.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {bid.cargo_request?.pickup_location} → {bid.cargo_request?.delivery_location}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3 text-gray-500">
                    <span>📦 {bid.cargo_request?.weight_kg ?? "?"} kg</span>
                    <span>💰 Budget: N${bid.cargo_request?.budget ?? "?"}</span>
                    <span>🏢 Carrier: {bid.carrier_name}</span>
                    <span>💵 Bid: N${bid.bid_amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Placed on {new Date(bid.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/cargo-requests/${bid.cargo_request_id}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                  >
                    View Cargo
                  </Link>
                  {bid.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateBidStatus(bid.id, "accepted")}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBidStatus(bid.id, "rejected")}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}