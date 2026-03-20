import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchInventory() {
    if (!supabase) return;
    const { data } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (data) setInventory(data);
    setLoading(false);
  }

  async function deleteProduct(id) {
    if (!confirm('Permanently delete this item?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchInventory();
  }

  useEffect(() => { fetchInventory(); }, []);

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>NamLogix <span style={{color: '#2563eb'}}>Africa</span></h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Windhoek Central Hub</p>
        </div>
        <Link href="/add-product" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
          + New Stock
        </Link>
      </header>

      <input 
        type="text" 
        placeholder="Search inventory..." 
        style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px', marginBottom: '25px' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '20px', textAlign: 'left', color: '#64748b' }}>Product</th>
              <th style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Stock</th>
              <th style={{ padding: '20px', textAlign: 'right', color: '#64748b' }}>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px', fontWeight: '700' }}>{item.name}</td>
                <td style={{ padding: '20px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold',
                    background: item.quantity <= 5 ? '#fee2e2' : '#dcfce7',
                    color: item.quantity <= 5 ? '#991b1b' : '#166534'
                  }}>
                    {item.quantity} units {item.quantity <= 5 && '⚠️'}
                  </span>
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <button onClick={() => deleteProduct(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}