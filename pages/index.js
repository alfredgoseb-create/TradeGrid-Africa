import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchInventory() {
    if (!supabase) return;
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setInventory(data);
    setLoading(false);
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchInventory(); // Refresh the list
  }

  useEffect(() => { fetchInventory(); }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>NamLogix Africa</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Live Inventory Management</p>
        </div>
        <Link href="/add-product" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Add Product
        </Link>
      </header>

      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#64748b' }}>Product Name</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>Stock Level</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>{item.name}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                    {item.quantity} units
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={() => deleteProduct(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}