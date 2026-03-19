import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('products')
      .insert([{ name, quantity: parseInt(quantity) }]);

    if (error) {
      alert(error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-slate-300 rounded-md p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Initial Stock Quantity</label>
            <input
              type="number"
              required
              className="mt-1 block w-full border border-slate-300 rounded-md p-2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? 'Saving...' : 'Confirm and Save'}
          </button>
        </form>
      </div>
    </Layout>
  );
}