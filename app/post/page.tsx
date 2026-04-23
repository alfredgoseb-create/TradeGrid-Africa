// app/post/page.tsx
"use client";
import Link from "next/link";

export default function PostChoice() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-2">What would you like to post?</h1>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Link href="/admin/cargo-requests" className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg">
            <div className="text-4xl mb-2">📦</div>
            <h2 className="text-xl font-semibold">Cargo Request</h2>
            <p className="text-gray-500 text-sm">I need to move goods</p>
          </Link>
          <Link href="/admin/trip-offers" className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg">
            <div className="text-4xl mb-2">🚛</div>
            <h2 className="text-xl font-semibold">Trip Offer</h2>
            <p className="text-gray-500 text-sm">I have vehicle space</p>
          </Link>
        </div>
      </div>
    </div>
  );
}