"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  stock_level: number;
  status: string;
  image_url: string;
  supplier: string;
};

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      alert("Failed to load products");
    } else {
      setProducts(data || []);
      const uniqueCategories = [...new Set((data || []).map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
    setLoading(false);
  }

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      if (!nameMatch && !descMatch) return false;
    }
    if (stockFilter === "inStock" && Number(product.stock_level) <= 0) return false;
    if (stockFilter === "outOfStock" && Number(product.stock_level) > 0) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setStockFilter("all");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">
            NamLogix <span className="text-blue-600">AFRICA</span>
          </h1>
          <div className="flex gap-4">
            <Link href="/order-status" className="text-sm text-gray-600 hover:text-gray-900">
              Track Order
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Products</h2>
          <p className="text-gray-600">Explore our inventory – quality products for Southern Africa</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">All Products</option>
                <option value="inStock">In Stock Only</option>
                <option value="outOfStock">Out of Stock Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Count */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/store/${product.id}`}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="h-48 bg-gray-100 relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    {product.category && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{product.category}</span>
                    )}
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        {product.unit && <span className="text-xs text-gray-500">Unit: {product.unit}</span>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm font-medium ${Number(product.stock_level) > 0 ? "text-green-600" : "text-red-600"}`}>
                            {Number(product.stock_level) > 0 ? `In Stock (${product.stock_level})` : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} NamLogix Africa – Connecting Southern African Trade
        </div>
      </footer>
    </div>
  );
}