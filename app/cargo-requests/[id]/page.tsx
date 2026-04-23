// app/cargo-requests/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CargoRequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [carrierName, setCarrierName] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  async function fetchRequest() {
    const { data } = await supabase.from("cargo_requests").select("*").eq("id", id).single();
    setRequest(data);
  }

  async function placeBid(e: React.FormEvent) {
    e.preventDefault();
    if (!carrierName || !bidAmount) return alert("Fill all fields");
    setSubmitting(true);
    const { error } = await supabase.from("bids").insert([{
      cargo_request_id: id,
      carrier_name: carrierName,
      bid_amount: parseFloat(bidAmount),
      status: "pending",
    }]);
    if (error) alert("Bid failed: " + error.message);
    else {
      alert("Bid placed successfully!");
      router.push("/bids");
    }
    setSubmitting(false);
  }

  if (!request) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold">{request.request_number || "Cargo Request"}</h1>
        <p className="text-gray-600 mt-2">{request.pickup_location} → {request.delivery_location}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>Weight: {request.weight_kg ?? "N/A"} kg</div>
          <div>Volume: {request.volume_cbm ?? "N/A"} cbm</div>
          <div>Transport: {request.transport_mode}</div>
          <div>Budget: N${request.budget}</div>
        </div>
        <p className="mt-4">{request.description}</p>
        <form onSubmit={placeBid} className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
          <input type="text" placeholder="Your name / company" className="w-full border rounded px-3 py-2 mb-3" value={carrierName} onChange={(e) => setCarrierName(e.target.value)} required />
          <input type="number" placeholder="Bid amount (N$)" className="w-full border rounded px-3 py-2 mb-3" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required />
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded">{submitting ? "Placing..." : "Submit Bid"}</button>
        </form>
      </div>
    </div>
  );
}