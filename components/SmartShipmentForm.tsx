// pages/shipments.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

interface ShipmentSuggestion {
  mode: 'rail' | 'sea' | 'road' | 'air';
  display: string;
  route: string;
  note: string;
}

export default function SmartShipmentForm() {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [suggestion, setSuggestion] = useState<ShipmentSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      toast.error('Please enter shipment details.');
      return;
    }

    const query = inputText.toLowerCase();

    if (query.includes('ship') || query.includes('sea') || query.includes('china')) {
      setSuggestion({
        mode: 'sea',
        display: '🚢 Sea Freight',
        route: 'Walvis Bay → Global',
        note: 'Bulk international export.',
      });
    } else if (query.includes('train') || query.includes('rail')) {
      setSuggestion({
        mode: 'rail',
        display: '🚂 Rail Freight',
        route: 'Trans-Zambezi Line',
        note: 'Inland heavy cargo.',
      });
    } else if (query.includes('fly') || query.includes('air')) {
      setSuggestion({
        mode: 'air',
        display: '✈️ Air Freight',
        route: 'HKIA Windhoek',
        note: 'High-value priority.',
      });
    } else {
      setSuggestion({
        mode: 'road',
        display: '🚛 Road Freight',
        route: 'SADC Road Network',
        note: 'Flexible regional delivery.',
      });
    }
  };

  const handleSave = async () => {
    if (!suggestion) {
      toast.error('No shipment suggestion to save.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('shipments').insert([
        {
          commodity_name: inputText,
          mode: suggestion.mode,
          destination_port: suggestion.route,
          status: 'Pending',
        },
      ]);

      if (error) throw error;

      toast.success('🚀 Shipment Registered!');
      setInputText('');
      setSuggestion(null);
    } catch (err: any) {
      toast.error(`Error saving shipment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted)
    return <div className="h-40 w-full bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-900">
      <h2 className="text-xl font-bold mb-4">AI Trade Dispatcher</h2>

      <textarea
        className="w-full p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="e.g. 50 tons of copper via rail..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all"
      >
        Analyze Logistics
      </button>

      {suggestion && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase">Mode</p>
              <p className="font-bold">{suggestion.display}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase">Route</p>
              <p className="font-bold">{suggestion.route}</p>
            </div>
          </div>
          <p className="mb-4 text-sm text-slate-700">{suggestion.note}</p>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      )}
    </div>
  );
}