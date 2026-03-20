import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [supplier, setSupplier] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        stock_level: parseInt(stock), 
        supplier, 
        status: parseInt(stock) < 10 ? 'Low Stock' : 'In Stock' 
      }]);
    
    if (!error) {
      router.push('/dashboard');
    } else {
      alert("Error adding product: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.push('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '4px' }}>← Back to Dashboard</button>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1e40af', marginTop: 0 }}>Add New Inventory</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Product Name</label>
            <input placeholder="e.g. Solar Panel 400W" onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Quantity</label>
            <input type="number" placeholder="0" onChange={(e) => setStock(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Supplier</label>
            <input placeholder="e.g. NamSolar" onChange={(e) => setSupplier(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            {loading ? 'Saving...' : 'Confirm & Add Stock'}
          </button>
        </form>
      </div>
    </div>
  );
}