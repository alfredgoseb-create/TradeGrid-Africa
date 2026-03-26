// pages/index.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Namlogix Africa Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-4">
            <h2 className="text-xl font-semibold">Add Product</h2>
            <Link href="/add-product">
              <Button>➕ Go</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-4">
            <h2 className="text-xl font-semibold">Marketplace</h2>
            <Link href="/marketplace">
              <Button>🛒 Go</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-4">
            <h2 className="text-xl font-semibold">Warehouse</h2>
            <Link href="/warehouse">
              <Button>🏬 Go</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-4">
            <h2 className="text-xl font-semibold">Shipments</h2>
            <Link href="/shipments">
              <Button>🚚 Go</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-4">
            <h2 className="text-xl font-semibold">Trades</h2>
            <Link href="/trades">
              <Button>📊 Go</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}