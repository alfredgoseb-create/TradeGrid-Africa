"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchProducts()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push("/login")
    }
  }

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*")
    if (error) console.error(error)
    else setProducts(data)
  }

  async function buyProduct(product: any) {
    if (product.stock <= 0) {
      alert("Out of stock")
      return
    }

    // create order
    await supabase.from("orders").insert({
      product_id: product.id,
      quantity: 1,
      total_price: product.price,
    })

    // update stock
    await supabase
      .from("products")
      .update({ stock: product.stock - 1 })
      .eq("id", product.id)

    fetchProducts()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="p-6">
      <button
        onClick={logout}
        className="bg-red-500 text-white px-3 py-1 mb-4"
      >
        Logout
      </button>

      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>

      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <h2 className="font-bold">{p.name}</h2>
            <p>{p.description}</p>
            <p className="text-green-600">NAD {p.price}</p>
            <p>Stock: {p.stock}</p>

            <button
              onClick={() => buyProduct(p)}
              className="bg-blue-500 text-white px-3 py-1 mt-2 rounded"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}