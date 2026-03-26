// pages/add-product.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddProduct() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col gap-4 p-6">
          <input
            type="text"
            placeholder="Product Name"
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Description"
            className="border p-2 rounded"
          />
          <Button>Add Product</Button>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/">
          <Button>⬅ Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}