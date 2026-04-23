// app/components/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // TRADING-FOCUSED NAVIGATION GROUPS
  const navGroups = {
    Marketplace: [
      { label: "📦 Find Cargo", href: "/cargo-requests" },
      { label: "🚛 Find Trips", href: "/trip-offers" },
      { label: "💰 Bids", href: "/bids" },
      { label: "📊 Trade Routes", href: "/trade-routes" },
    ],
    "My Activity": [
      { label: "My Cargo Requests", href: "/my/cargo-requests" },
      { label: "My Trip Offers", href: "/my/trip-offers" },
      { label: "My Bookings", href: "/my/bookings" },
      { label: "My Bids", href: "/my/bids" },
    ],
    Infrastructure: [
      { label: "🏭 Warehouses", href: "/warehouses" },
      { label: "🚚 Vehicles", href: "/vehicles" },
      { label: "📍 Stock Locations", href: "/stock-locations" },
      { label: "📦 Stock Transactions", href: "/stock-transactions" },
    ],
    Tools: [
      { label: "📄 Customs Docs", href: "/customs-documents" },
      { label: "🔍 Barcode Scanner", href: "/barcode-scanner" },
      { label: "🛍️ Store", href: "/store" },
    ],
    Admin: [
      { label: "📈 Dashboard", href: "/admin/dashboard" },
      { label: "👥 Users", href: "/admin/users" },
      { label: "🚛 Shipments (admin)", href: "/admin/shipments" },
      { label: "📋 Inquiries", href: "/admin/inquiries" },
      { label: "📦 Orders", href: "/admin/orders" },
      { label: "📊 Analytics", href: "/admin/analytics" },
      { label: "🏭 Warehouse Admin", href: "/admin/warehouses" },
      { label: "🚚 Vehicle Admin", href: "/admin/vehicles" },
    ],
  };

  function toggleDropdown(name: string) {
    setOpenDropdown(openDropdown === name ? null : name);
  }

  function handleNavigation(href: string) {
    router.push(href);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const renderDesktopNav = () => (
    <div className="hidden md:flex items-center gap-2">
      {Object.entries(navGroups).map(([groupName, items]) => (
        <div key={groupName} className="relative">
          <button
            onClick={() => toggleDropdown(groupName)}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium flex items-center gap-1"
          >
            {groupName}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === groupName && (
            <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border z-20 py-1">
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMobileMenu = () => (
    <div
      className={`fixed inset-0 z-50 transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out md:hidden`}
    >
      <div className="relative w-64 bg-white h-full shadow-xl border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <Link href="/" className="font-bold text-lg" onClick={() => setMobileMenuOpen(false)}>
            NamLogix AFRICA
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {Object.entries(navGroups).map(([groupName, items]) => (
            <div key={groupName} className="border-b">
              <div className="px-4 py-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                {groupName}
              </div>
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50 -z-10" onClick={() => setMobileMenuOpen(false)} />
    </div>
  );

  return (
    <>
      <nav className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="font-bold text-xl">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </Link>
        </div>
        {renderDesktopNav()}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-gray-500">Trader</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>
      {renderMobileMenu()}
    </>
  );
}