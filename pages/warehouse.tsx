import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ✅ Safe custom type (no naming conflict)
interface WarehouseItem {
  id: number;
  name: string;
  stock: number;
}

export default function Warehouse() {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    // ✅ FIX: remove <WarehouseItem> from .from()
    const { data, error } = await supabase
      .from("warehouse")
      .select("*");

    if (error) {
      console.error(error);
    } 
    // ✅ Cast data safely
    else if (data) {
      setItems(data as WarehouseItem[]);
    }

    setLoading(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Warehouse Inventory</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
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
      )}

      <div className="mt-6 text-center">
        <Link href="/">
          <Button>⬅ Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}