import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{ name, quantity: parseInt(quantity) }]);

      if (error) throw error;
      router.push('/');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Dashboard</Link>
      
      <div style={{ marginTop: '30px', background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Add New Stock</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Product Name</label>
            <input 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Solar Panel 400W"
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Quantity</label>
            <input 
              required
              type="number"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px' }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>

          <button 
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {loading ? 'Saving to Database...' : 'Confirm & Add to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
}