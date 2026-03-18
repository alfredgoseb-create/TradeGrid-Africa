import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({ products: 0, warehouses: 0, shipments: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: wCount } = await supabase.from('warehouses').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('shipments').select('*', { count: 'exact', head: true });
      
      setStats({ products: pCount || 0, warehouses: wCount || 0, shipments: sCount || 0 });
    }
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#0070f3', fontSize: '2.5rem' }}>NamLogix Africa</h1>
        <p style={{ color: '#666' }}>Supply Chain & Logistics Management Dashboard</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Statistics Cards */}
        <div style={cardStyle}>
          <h3>Total Inventory</h3>
          <p style={statStyle}>{stats.products}</p>
          <Link href="/products" style={linkStyle}>Manage Products →</Link>
        </div>

        <div style={cardStyle}>
          <h3>Warehouses</h3>
          <p style={statStyle}>{stats.warehouses}</p>
          <Link href="/warehouse" style={linkStyle}>View Locations →</Link>
        </div>

        <div style={cardStyle}>
          <h3>Live Shipments</h3>
          <p style={statStyle}>{stats.shipments}</p>
          <Link href="/shipments" style={linkStyle}>Track Orders →</Link>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { border: '1px solid #eaeaea', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const statStyle = { fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0', color: '#0070f3' };
const linkStyle = { color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' };