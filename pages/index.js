import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({ products: 0, warehouses: 0, shipments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Fetch counts from your Supabase tables
      const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: wCount } = await supabase.from('warehouses').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('shipments').select('*', { count: 'exact', head: true });
      
      setStats({
        products: pCount || 0,
        warehouses: wCount || 0,
        shipments: sCount || 0
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div style={containerStyle}>
      {/* Sidebar / Navigation */}
      <nav style={sidebarStyle}>
        <h2 style={{ color: 'white', marginBottom: '30px' }}>NamLogix</h2>
        <div style={navGroup}>
          <Link href="/products" style={navLink}>📦 Inventory</Link>
          <Link href="/warehouse" style={navLink}>🏢 Warehouses</Link>
          <Link href="/shipments" style={navLink}>🚚 Shipments</Link>
          <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
          <Link href="/add-product" style={addBtnStyle}>+ Add New Item</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, color: '#1e293b' }}>Operations Overview</h1>
            <p style={{ color: '#64748b' }}>Real-time logistics data for Namibia</p>
          </div>
          <div style={statusBadge}>● System Live</div>
        </header>

        {/* Stats Grid */}
        <section style={gridStyle}>
          <div style={statCard}>
            <span style={iconStyle}>📦</span>
            <h3>Total Products</h3>
            <p style={numberStyle}>{loading ? '...' : stats.products}</p>
          </div>

          <div style={statCard}>
            <span style={iconStyle}>🏢</span>
            <h3>Active Warehouses</h3>
            <p style={numberStyle}>{loading ? '...' : stats.warehouses}</p>
          </div>

          <div style={statCard}>
            <span style={iconStyle}>🚚</span>
            <h3>Live Shipments</h3>
            <p style={numberStyle}>{loading ? '...' : stats.shipments}</p>
          </div>
        </section>

        {/* Welcome Section */}
        <section style={welcomeSection}>
          <h2>Welcome back, Alfred</h2>
          <p>Your supply chain is currently running at 100% capacity. Use the sidebar to manage your inventory or track incoming shipments.</p>
        </section>
      </main>
    </div>
  );
}

// --- Styles ---
const containerStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' };

const sidebarStyle = { width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column' };

const navGroup = { display: 'flex', flexDirection: 'column', gap: '10px' };

const navLink = { color: '#94a3b8', textDecoration: 'none', padding: '12px', borderRadius: '8px', transition: '0.2s', fontSize: '1.1rem' };

const addBtnStyle = { ...navLink, backgroundColor: '#0070f3', color: 'white', textAlign: 'center', fontWeight: 'bold' };

const mainContentStyle = { flex: 1, padding: '40px' };

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };

const statusBadge = { backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' };

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' };

const statCard = { backgroundColor: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

const iconStyle = { fontSize: '2rem', marginBottom: '10px', display: 'block' };

const numberStyle = { fontSize: '2.5rem', fontWeight: '800', margin: '10px 0', color: '#0f172a' };

const welcomeSection = { backgroundColor: '#eff6ff', padding: '30px', borderRadius: '16px', border: '1px solid #bfdbfe', color: '#1e40af' };