// app/admin/shipments/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Shipment = {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  current_location: string;
  estimated_delivery: string;
  shipped_at: string;
  delivered_at: string;
  notes: string;
  created_at: string;
  updated_at: string;
  orders?: { product_name: string; customer_name: string };
};

export default function ShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [form, setForm] = useState({
    order_id: "",
    tracking_number: "",
    carrier: "",
    status: "pending",
    current_location: "",
    estimated_delivery: "",
    notes: "",
  });

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // Fetch shipments with order details
      const { data: shipmentsData, error: sError } = await supabase
        .from("shipments")
        .select(`*, orders ( product_name, customer_name )`)
        .order("created_at", { ascending: false });

      if (sError) {
        console.error("Shipments fetch error:", sError);
        setError(`Failed to load shipments: ${sError.message}`);
      } else {
        setShipments(shipmentsData || []);
      }

      // Fetch orders without shipments (to assign new shipments)
      const { data: ordersData, error: oError } = await supabase
        .from("orders")
        .select("id, order_number, product_name, customer_name");

      if (oError) {
        console.error("Orders fetch error:", oError);
      } else {
        // Filter out orders that already have a shipment
        const shippedOrderIds = (shipmentsData || []).map(s => s.order_id).filter(Boolean);
        const availableOrders = (ordersData || []).filter(o => !shippedOrderIds.includes(o.id));
        setOrders(availableOrders);
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tracking_number) {
      alert("Tracking number is required");
      return;
    }
    try {
      if (editingShipment) {
        const { error } = await supabase
          .from("shipments")
          .update({
            order_id: form.order_id || null,
            tracking_number: form.tracking_number,
            carrier: form.carrier,
            status: form.status,
            current_location: form.current_location,
            estimated_delivery: form.estimated_delivery || null,
            notes: form.notes,
          })
          .eq("id", editingShipment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shipments").insert([{
          order_id: form.order_id || null,
          tracking_number: form.tracking_number,
          carrier: form.carrier,
          status: form.status,
          current_location: form.current_location,
          estimated_delivery: form.estimated_delivery || null,
          notes: form.notes,
        }]);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingShipment(null);
      setForm({
        order_id: "",
        tracking_number: "",
        carrier: "",
        status: "pending",
        current_location: "",
        estimated_delivery: "",
        notes: "",
      });
      fetchData();
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
  }

  async function updateStatus(shipmentId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("shipments")
        .update({ status: newStatus })
        .eq("id", shipmentId);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    in_transit: "bg-yellow-100 text-yellow-700",
    customs_hold: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shipments</h1>
            <p className="text-gray-600">Track and manage all shipments.</p>
          </div>
          <button
            onClick={() => {
              setEditingShipment(null);
              setForm({
                order_id: "",
                tracking_number: "",
                carrier: "",
                status: "pending",
                current_location: "",
                estimated_delivery: "",
                notes: "",
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Shipment
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No shipments yet. Click "New Shipment" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold">
                        {shipment.tracking_number}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {shipment.status?.replace("_", " ").toUpperCase() || "PENDING"}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {shipment.carrier || "Carrier not specified"}
                    </p>
                    {shipment.orders && (
                      <p className="text-sm text-gray-500">
                        Order: {shipment.orders.product_name} – {shipment.orders.customer_name}
                      </p>
                    )}
                    {shipment.current_location && (
                      <p className="text-sm mt-1">📍 {shipment.current_location}</p>
                    )}
                    {shipment.estimated_delivery && (
                      <p className="text-sm text-gray-500">
                        Est. delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={shipment.status}
                      onChange={(e) => updateStatus(shipment.id, e.target.value)}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="in_transit">In Transit</option>
                      <option value="customs_hold">Customs Hold</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingShipment(shipment);
                        setForm({
                          order_id: shipment.order_id || "",
                          tracking_number: shipment.tracking_number,
                          carrier: shipment.carrier || "",
                          status: shipment.status,
                          current_location: shipment.current_location || "",
                          estimated_delivery: shipment.estimated_delivery?.split("T")[0] || "",
                          notes: shipment.notes || "",
                        });
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-gray-100 rounded text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingShipment ? "Edit Shipment" : "New Shipment"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Order (optional)</label>
                  <select
                    value={form.order_id}
                    onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">None</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.product_name} ({order.customer_name})
                      </option>
                    ))}
                    {editingShipment && editingShipment.order_id && (
                      <option value={editingShipment.order_id}>
                        Existing order (ID: {editingShipment.order_id.slice(0,8)})
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking Number *</label>
                  <input
                    type="text"
                    value={form.tracking_number}
                    onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Carrier</label>
                  <input
                    type="text"
                    value={form.carrier}
                    onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                    placeholder="e.g., DHL, FedEx, NamPost"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="customs_hold">Customs Hold</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Location</label>
                  <input
                    type="text"
                    value={form.current_location}
                    onChange={(e) => setForm({ ...form, current_location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={form.estimated_delivery}
                    onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    {editingShipment ? "Save Changes" : "Create Shipment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}