// app/admin/inquiries/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Inquiry = {
  id: string;
  product_id: string;
  product_name: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchInquiries();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchInquiries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch: " + error.message);
    else setInquiries(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Customer Inquiries</h1>
          <p className="text-gray-600">Messages from the storefront contact forms.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <p>Loading...</p>
          ) : inquiries.length === 0 ? (
            <p className="text-gray-500">No inquiries yet.</p>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{inq.product_name || "General Inquiry"}</h3>
                      <p className="text-sm text-gray-600">From: {inq.name} ({inq.email})</p>
                      <p className="text-xs text-gray-400">{new Date(inq.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{inq.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}