"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Bid = {
  id: string;
  cargo_request_id: string;
  request_number?: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  vehicle_id: string;
  vehicle_info?: string;
  bid_amount: number;
  estimated_days: number;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    checkUser();
    fetchBids();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchBids() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bids")
      .select(`
        *,
        cargo_requests(request_number, pickup_location, delivery_location),
        vehicles(registration_number, make_model, vehicle_type)
      `)
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch bids: " + error.message);
    else {
      const mapped = (data || []).map((b: any) => ({
        ...b,
        request_number: b.cargo_requests?.request_number,
        vehicle_info: b.vehicles ? `${b.vehicles.vehicle_type} ${b.vehicles.registration_number}` : null,
      }));
      setBids(mapped);
    }
    setLoading(false);
  }

  async function updateBidStatus(bidId: string, newStatus: string) {
    const { error } = await supabase
      .from("bids")
      .update({ status: newStatus })
      .eq("id", bidId);
    if (error) alert("Failed to update status: " + error.message);
    else fetchBids();
  }

  async function acceptBidAndAssign(bid: Bid) {
    if (!confirm(`Accept bid from ${bid.owner_name} for N$${bid.bid_amount}? This will assign the cargo request to this vehicle owner.`)) return;
    
    // Update bid status to accepted
    const { error: bidError } = await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bid.id);
    if (bidError) {
      alert("Failed to accept bid: " + bidError.message);
      return;
    }

    // Update cargo request: assign vehicle and set status to assigned
    const { error: cargoError } = await supabase
      .from("cargo_requests")
      .update({ 
        assigned_vehicle_id: bid.vehicle_id,
        status: "assigned"
      })
      .eq("id", bid.cargo_request_id);
    if (cargoError) alert("Failed to assign cargo request: " + cargoError.message);
    else fetchBids();
  }

  async function deleteBid(id: string) {
    if (!confirm("Delete this bid?")) return;
    const { error } = await supabase.from("bids").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchBids();
  }

  const filteredBids = statusFilter === "all" ? bids : bids.filter(b => b.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bids Management</h1>
          <p className="text-gray-600">Review bids from vehicle owners on cargo requests.</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
          >
            All ({bids.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === "pending" ? "bg-yellow-600 text-white" : "bg-white text-gray-600"}`}
          >
            Pending ({bids.filter(b => b.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("accepted")}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === "accepted" ? "bg-green-600 text-white" : "bg-white text-gray-600"}`}
          >
            Accepted ({bids.filter(b => b.status === "accepted").length})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === "rejected" ? "bg-red-600 text-white" : "bg-white text-gray-600"}`}
          >
            Rejected ({bids.filter(b => b.status === "rejected").length})
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredBids.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">No bids found.</div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <div key={bid.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">Bid for {bid.request_number}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[bid.status] || "bg-gray-100"}`}>
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Submitted: {new Date(bid.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {bid.status === "pending" && (
                      <>
                        <button
                          onClick={() => acceptBidAndAssign(bid)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept & Assign
                        </button>
                        <button
                          onClick={() => updateBidStatus(bid.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteBid(bid.id)} className="text-gray-500 hover:text-red-600 text-sm">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Owner</p>
                    <p className="font-medium">{bid.owner_name}</p>
                    {bid.owner_phone && <p className="text-sm">📞 {bid.owner_phone}</p>}
                    {bid.owner_email && <p className="text-sm">✉️ {bid.owner_email}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p>{bid.vehicle_info || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bid Details</p>
                    <p className="font-semibold text-green-600">N${bid.bid_amount.toLocaleString()}</p>
                    {bid.estimated_days && <p className="text-sm">⏱️ {bid.estimated_days} days</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="text-sm">📍 {bid.cargo_requests?.pickup_location} → {bid.cargo_requests?.delivery_location}</p>
                  </div>
                </div>
                {bid.message && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <span className="font-medium">Message:</span> {bid.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}