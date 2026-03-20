import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Authentication & Data Initialization
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchInventory();
      }
    };
    checkUser();
  }, []);

  // 2. Fetch Live Inventory Data
  async function fetchInventory() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setInventory(data);
    setLoading(false);
  }

  // 3. Quick Stock Adjustments
  async function updateStock(id, newQty) {
    if (newQty < 0) return;
    const { error } = await supabase
      .from('products')
      .update({ quantity: newQty })
      .eq('id', id);
    
    if (!error) fetchInventory();
  }

  // 4. Export Inventory to CSV
  const exportToCSV = () => {
    const headers = 'Product Name,Quantity,Last Updated\n';
    const rows = inventory.map(i => `${i.name},${i.quantity},${i.created_at}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NamLogix_Inventory_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  // 5. Search Filtering
  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      {/* Header Section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>NamLogix <span style={{color: '#2563eb'}}>Africa</span></h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Secure Inventory Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToCSV} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            Export CSV
          </button>
          <Link href="/add-product" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
            + New Stock
          </Link>
        </div>
      </header>

      {/* Search Input */}
      <div style={{ marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="Search items by name..." 
          style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '20px', textAlign: 'left', color: '#64748b' }}>Product</th>
              <th style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Quick Adjust</th>
              <th style={{ padding: '20px', textAlign: 'right', color: '#64748b' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center' }}>Verifying credentials...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center' }}>No products found.</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px', fontWeight: '700' }}>{item.name}</td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                      <button onClick={() => updateStock(item.id, item.quantity - 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: '40px', fontWeight: '900', fontSize: '18px' }}>{item.quantity}</span>
                      <button onClick={() => updateStock(item.id, item.quantity + 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <span style={{ 
                      padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px',
                      background: item.quantity <= 5 ? '#fee2e2' : '#dcfce7',
                      color: item.quantity <= 5 ? '#991b1b' : '#166534'
                    }}>
                      {item.quantity <= 0 ? 'Out of Stock' : item.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
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