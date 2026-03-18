import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setStatus('Saving...');

    const { error } = await supabase
      .from('products')
      .insert([{ name, price: parseFloat(price) }]);

    if (error) {
      setStatus('Error: ' + error.message);
    } else {
      setStatus('Success! Product added.');
      setName('');
      setPrice('');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Add New Inventory</h1>
      <Link href="/">← Back to Dashboard</Link>
      
      <form onSubmit={handleAdd} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" placeholder="Product Name (e.g. Solar Panel)" 
          value={name} onChange={(e) => setName(e.target.value)} required 
          style={inputStyle}
        />
        <input 
          type="number" placeholder="Price (N$)" 
          value={price} onChange={(e) => setPrice(e.target.value)} required 
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Add to NamLogix Database</button>
      </form>
      
      {status && <p style={{ marginTop: '20px', color: status.includes('Success') ? 'green' : 'red' }}>{status}</p>}
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const buttonStyle = { padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };