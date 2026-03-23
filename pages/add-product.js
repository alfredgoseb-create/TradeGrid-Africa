import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', stock_level: '', supplier: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await supabase.from('products').insert([{ ...formData, stock_level: parseInt(formData.stock_level), status: 'In Stock', unit: 'pcs' }]);
    router.push('/dashboard');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>Dashboard</Link>
        <Link href="/add-product" style={{ fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>Add Stock</Link>
      </nav>
      
      <h2 style={{ color: '#1e40af' }}>Add New Stock Item</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
        <input type="text" placeholder="Item Name (e.g. 5kW Inverter)" required onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="number" placeholder="Quantity" required onChange={e => setFormData({...formData, stock_level: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="text" placeholder="Supplier" required onChange={e => setFormData({...formData, supplier: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} />
        <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save to Inventory</button>
      </form>
    </div>
  );
}