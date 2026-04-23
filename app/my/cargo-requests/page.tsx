// app/my/cargo-requests/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyCargoRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  async function fetchMyRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    const { data, error } = await supabase
      .from("cargo_requests")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setRequests(data || []);
    setLoading(false);
  }

  async function deleteRequest(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("cargo_requests").delete().eq("id", id);
    fetchMyRequests();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Cargo Requests</h1>
        {requests.length === 0 && <div className="bg-white rounded-lg shadow p-6 text-center">No requests yet.</div>}
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-lg shadow p-5 mb-4 flex justify-between items-center">
            <div>
              <p><strong>{req.request_number}</strong> – {req.pickup_location} → {req.delivery_location}</p>
              <p className="text-sm text-gray-500">Status: {req.status} · Budget: N${req.budget}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/cargo-requests/${req.id}`} className="text-blue-600 text-sm">View</Link>
              <button onClick={() => deleteRequest(req.id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}