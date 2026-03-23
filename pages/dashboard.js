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

  // Handle Search and Filter logic
  useEffect(() => {
    let results = products.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'All') {
      results = results.filter(item => item.status === filterStatus);
    }

    setFilteredProducts(results);
  }, [searchTerm, filterStatus, products]);

  const deleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert("Error: " + error.message);
      else fetchInventory();
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e40af', margin: 0 }}>NamLogix Africa Inventory</h1>
        <Link href="/add-product">
          <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            + New Stock
          </button>
        </Link>
      </header>

      {/* Search and Filter Section */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search by name or supplier..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}
        />
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        >
          <option value="All">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px' }}>Product</th>
              <th style={{ padding: '16px' }}>Stock Level</th>
              <th style={{ padding: '16px' }}>Supplier</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No matching items found.</td></tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{item.name}</td>
                  <td style={{ padding: '16px' }}>{item.stock_level} {item.unit || 'pcs'}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{item.supplier}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', 
                      backgroundColor: item.stock_level > 10 ? '#dcfce7' : item.stock_level > 0 ? '#fef9c3' : '#fee2e2', 
                      color: item.stock_level > 10 ? '#166534' : item.stock_level > 0 ? '#854d0e' : '#991b1b' 
                    }}>
                      {item.stock_level > 10 ? 'In Stock' : item.stock_level > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '10px' }}>
                    <Link href={`/edit-product?id=${item.id}`}>
                      <button style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                    </Link>
                    <button onClick={() => deleteItem(item.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
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