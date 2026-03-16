import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function WarehouseDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inventory data from Supabase
  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        quantity,
        storage_location,
        products (name, unit)
      `);
    
    if (error) console.log('Error loading inventory:', error);
    else setInventory(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>TradeGrid Africa: Warehouse Management</h1>
      <p>Manage your stored goods and stock levels.</p>

      <hr />

      <h2>Current Inventory</h2>
      {loading ? (
        <p>Loading stock levels...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Location in Warehouse</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.products?.name}</td>
                <td>{item.quantity}</td>
                <td>{item.products?.unit}</td>
                <td>{item.storage_location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '30px' }}>
        <button onClick={fetchInventory} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Refresh Stock List
        </button>
      </div>
    </div>
  );
}