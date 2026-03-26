import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddProduct() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const { data, error } = await supabase?.from('products').insert([
      {
        name,
        price: Number(price),
        stock: Number(stock),
      },
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Product added successfully!')
      setName('')
      setPrice('')
      setStock('')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Product</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br /><br />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        /><br /><br />

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        /><br /><br />

        <button type="submit">Add Product</button>
      </form>
    </div>
  )
}