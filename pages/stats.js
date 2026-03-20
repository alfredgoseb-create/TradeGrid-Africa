import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Stats() {
  const [counts, setCounts] = useState({ total: 0, low: 0 });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*');
      if (data) {
        setCounts({
          total: data.length,
          low: data.filter(i => i.quantity <= 5).length
        });
      }
    }
    load();
  }, []);

  return (
    <div className="container">
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>← Dashboard</Link>
      <h1 style={{ fontWeight: '900', marginTop: '20px' }}>Inventory Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Total SKUs</h3>
          <p style={{ fontSize: '48px', fontWeight: '900', margin: '10px 0 0 0' }}>{counts.total}</p>
        </div>
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, color: '#ef4444' }}>Low Stock Items</h3>
          <p style={{ fontSize: '48px', fontWeight: '900', margin: '10px 0 0 0', color: '#ef4444' }}>{counts.low}</p>
        </div>
      </div>
    </div>
  );
}