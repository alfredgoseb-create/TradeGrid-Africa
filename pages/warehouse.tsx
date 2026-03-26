// pages/warehouse.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Warehouse() {
  const items = [
    { id: 1, name: "Product A", stock: 120 },
    { id: 2, name: "Product B", stock: 80 },
    { id: 3, name: "Product C", stock: 200 },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Warehouse Inventory</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-2 p-4">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p>Stock: {item.stock}</p>
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