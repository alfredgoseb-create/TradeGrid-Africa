'use client';

import { useState } from 'react';

export default function NotifyPage() {
  const [productName, setProductName] = useState('Copper');
  const [stock, setStock] = useState(0);
  const [responseMessage, setResponseMessage] = useState('');

  const notifyOutOfStock = async () => {
    try {
      const response = await fetch('/api/notify-out-of-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: { name: productName, stock } })
      });
      const data = await response.json();
      setResponseMessage(data.message);
    } catch (err) {
      console.error('Error calling API:', err);
      setResponseMessage('Error sending notification');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md border border-slate-200 text-slate-900">
      <h1 className="text-2xl font-bold mb-4">Notify Out of Stock</h1>

      <div className="mb-4">
        <label className="block mb-1 font-bold">Product Name:</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-bold">Stock:</label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <button
        onClick={notifyOutOfStock}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold"
      >
        Notify
      </button>

      {responseMessage && (
        <p className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
          {responseMessage}
        </p>
      )}
    </div>
  );
}