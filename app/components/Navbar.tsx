"use client";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { label: "Warehouses", href: "/admin/warehouses" },
{ label: "Stock Locations", href: "/admin/stock-locations" },
{ label: "Stock Transactions", href: "/admin/stock-transactions" },
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Suppliers", href: "/admin/suppliers" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Inquiries", href: "/admin/inquiries" },
    { label: "Warehouse Dashboard", href: "/admin/warehouse-dashboard" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Users", href: "/admin/users" },
    { label: "Cargo Requests", href: "/admin/cargo-requests" },
    { label: "Trip Offers", href: "/admin/trip-offers" },
{ label: "Trip Bookings", href: "/admin/trip-bookings" },
    { label: "Vehicles", href: "/admin/vehicles" },
    { label: "Barcode Scanner", href: "/admin/barcode-scanner" },
    { label: "Shipments", href: "/admin/shipments" },
    { label: "Bids", href: "/admin/bids" },
    { label: "Trade Routes", href: "/admin/trade-routes" },
    { label: "Customs Docs", href: "/admin/customs-documents" },  // 👈 NEW
    { label: "Store", href: "/store" },
    { label: "Warehouse Transfers", href: "/admin/warehouse-transfers" },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <span className="font-bold text-xl">
        NamLogix <span className="text-blue-600">AFRICA</span>
      </span>
      <div className="flex gap-2">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className={
              pathname === link.href
                ? "px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
                : "px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm"
            }
          >
            {link.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Admin</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}