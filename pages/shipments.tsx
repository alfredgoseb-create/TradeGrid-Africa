// pages/shipments.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Shipments() {
  const shipments = [
    { id: 1, order: "Order 101", status: "In Transit" },
    { id: 2, order: "Order 102", status: "Delivered" },
    { id: 3, order: "Order 103", status: "Pending" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Shipments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {shipments.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-2 p-4">
              <h2 className="text-xl font-semibold">{s.order}</h2>
              <p>Status: {s.status}</p>
              <Button>🔄 Update</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/">
          <Button>⬅ Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}