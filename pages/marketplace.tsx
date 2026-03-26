// pages/marketplace.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Marketplace() {
  // Placeholder products
  const products = [
    { id: 1, name: "Product A", price: 50 },
    { id: 2, name: "Product B", price: 75 },
    { id: 3, name: "Product C", price: 100 },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col gap-4 p-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-700">${product.price}</p>
              <Button>🛒 Buy</Button>
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