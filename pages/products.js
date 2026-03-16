import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Products() {

  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')

    setProducts(data)
  }

  return (
    <div>
      <h1>Products</h1>

      {products.map(product => (
        <div key={product.id}>
          {product.name}
        </div>
      ))}

    </div>
  )
}