const fs = require('fs');
const code = `"use client";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Suppliers", href: "/admin/suppliers" },
    { label: "Analytics", href: "/admin/analytics" },
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
}`;
fs.writeFileSync('app/components/Navbar.tsx', code);
console.log('Done!');
