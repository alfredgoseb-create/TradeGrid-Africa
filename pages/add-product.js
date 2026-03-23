import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AddProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', stock_level: '', supplier: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from('products').insert([
      { 
        name: formData.name, 
        stock_level: parseInt(formData.stock_level), 
        supplier: formData.supplier,
        status: 'In Stock',
        unit: 'pcs'
      }
    ]);

    if (error) {
      alert("Error: " + error.message);
      setIsSaving(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.back()} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back</button>
      <h2 style={{ color: '#1e40af' }}>Add New Inventory</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>Product Name</label>
        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label>Quantity</label>
        <input type="number" required value={formData.stock_level} onChange={(e) => setFormData({...formData, stock_level: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label>Supplier</label>
        <input type="text" required value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <button type="submit" disabled={isSaving} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {isSaving ? 'Saving...' : 'Confirm & Add Stock'}
        </button>
      </form>
    </div>
  );
}