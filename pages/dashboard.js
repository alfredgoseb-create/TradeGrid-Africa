import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, color: '#1e40af' }}>NamLogix <span style={{ color: '#2563eb' }}>AFRICA</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>wildernesafrica@gmail.com</span>
          <button onClick={handleLogout} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Inventory Dashboard</h2>
          <button 
            onClick={() => router.push('/add-product')}
            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + New Stock
          </button>
        </div>

        {/* Inventory Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '15px' }}>Product</th>
                <th style={{ padding: '15px' }}>Stock Level</th>
                <th style={{ padding: '15px' }}>Supplier</th>
                <th style={{ padding: '15px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading warehouse data...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No items found. Click "+ New Stock" to add inventory.</td></tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '15px' }}>{item.stock_level} units</td>
                    <td style={{ padding: '15px', color: '#6b7280' }}>{item.supplier || 'Not set'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        backgroundColor: item.stock_level < 10 ? '#fef2f2' : '#f0fdf4', 
                        color: item.stock_level < 10 ? '#dc2626' : '#16a34a',
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                      }}>
                        {item.stock_level < 10 ? 'Low Stock' : 'Healthy'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}