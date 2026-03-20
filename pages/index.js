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
    if (!confirm('Are you sure you want to delete this item?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchInventory();
  }

  useEffect(() => { fetchInventory(); }, []);

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculations
  const totalStock = inventory.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const lowStockCount = inventory.filter(item => item.quantity <= 5).length;

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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '600' }}>Unique Products</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{inventory.length}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '600' }}>Total Units</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{totalStock}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#ef4444', fontSize: '14px', margin: 0, fontWeight: '600' }}>Low Stock Alert</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '5px 0 0 0', color: '#ef4444' }}>{lowStockCount}</p>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search inventory by name..." 
        style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px', marginBottom: '25px' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '20px', textAlign: 'left', color: '#64748b' }}>Product Name</th>
              <th style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Quantity</th>
              <th style={{ padding: '20px', textAlign: 'right', color: '#64748b' }}>Manage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Fetching live data...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No items found. Start by adding new stock!</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px', fontWeight: '700', color: '#1e293b' }}>{item.name}</td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
                      background: item.quantity <= 5 ? '#fee2e2' : '#dcfce7',
                      color: item.quantity <= 5 ? '#991b1b' : '#166534'
                    }}>
                      {item.quantity} units {item.quantity <= 5 && '⚠️'}
                    </span>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <button onClick={() => deleteProduct(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}