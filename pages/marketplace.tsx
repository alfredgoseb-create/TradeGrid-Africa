import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase?.from('products').select('*')

    if (error) {
      console.log(error)
    } else {
      setProducts(data || [])
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Marketplace</h1>

      {products.map((product) => (
        <div key={product.id} style={{ marginBottom: 10 }}>
          <strong>{product.name}</strong> - N${product.price} | Stock: {product.stock}
        </div>
      ))}
    </div>
  )
}