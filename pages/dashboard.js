import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  async function fetchInventory() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    let results = products.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'All') {
      const checkStatus = (level) => {
        if (level > 10) return 'In Stock';
        if (level > 0) return 'Low Stock';
        return 'Out of Stock';
      };
      results = results.filter(item => checkStatus(item.stock_level) === filterStatus);
    }
    setFilteredProducts(results);
  }, [searchTerm, filterStatus, products]);

  const downloadCSV = () => {
    const headers = ['Product Name,Stock Level,Unit,Supplier,Status\n'];
    const rows = filteredProducts.map(item => 
      `${item.name},${item.stock_level},${item.unit || 'pcs'},${item.supplier},${item.stock_level > 0 ? 'In Stock' : 'Out of Stock'}`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NamLogix_Inventory_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const deleteItem = async (id) => {
    if (confirm("Are you sure?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchInventory();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <Link href="/dashboard" style={{ fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>Dashboard</Link>
        <Link href="/add-product" style={{ color: '#64748b', textDecoration: 'none' }}>Add Stock</Link>
        <div style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '14px' }}>NamLogix Africa Management System</div>
      </nav>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1e40af' }}>Inventory Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={downloadCSV} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            📥 Download Excel (CSV)
          </button>
          <Link href="/add-product">
            <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              + New Stock
            </button>
          </Link>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" placeholder="Search inventory..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
        />
        <select onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Stock</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Supplier</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.name}</td>
                <td style={{ padding: '15px' }}>{item.stock_level} {item.unit || 'pcs'}</td>
                <td style={{ padding: '15px' }}>{item.supplier}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '15px', fontSize: '12px',
                    backgroundColor: item.stock_level > 10 ? '#dcfce7' : item.stock_level > 0 ? '#fef9c3' : '#fee2e2',
                    color: item.stock_level > 10 ? '#166534' : item.stock_level > 0 ? '#854d0e' : '#991b1b'
                  }}>
                    {item.stock_level > 10 ? 'In Stock' : item.stock_level > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                  <Link href={`/edit-product?id=${item.id}`}><button style={{ color: '#f59e0b', background: 'none', border: '1px solid #f59e0b', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button></Link>
                  <button onClick={() => deleteItem(item.id)} style={{ color: '#ef4444', background: 'none', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}