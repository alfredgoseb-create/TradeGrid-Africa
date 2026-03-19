import { useState, useEffect } from 'react';
import { supabase, deleteProduct } from '../lib/supabaseClient';

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setInventory(data);
    setLoading(false);
  }

  async function handleDelete(id, name) {
    const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      // Remove the item from the local state so the UI updates instantly
      setInventory(inventory.filter(item => item.id !== id));
      alert("Product removed successfully");
    } catch (error) {
      alert("Error deleting product: " + error.message);
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">NamLogix Inventory</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && !loading && (
          <p className="p-6 text-center text-gray-500">No items found in inventory.</p>
        )}
      </div>
    </div>
  );
}