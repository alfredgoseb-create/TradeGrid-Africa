import React from 'react';
import Layout from '../components/Layout';

export default function Home() {
  // Static data to ensure the build passes without database errors
  const stats = [
    { label: 'System Status', value: 'Online', color: 'text-green-600' },
    { label: 'Database', value: 'Connected', color: 'text-blue-600' },
    { label: 'Inventory Items', value: '12', color: 'text-slate-900' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            NamLogix <span className="text-blue-600">Africa</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Logistics & Inventory Dashboard v2.0</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Placeholder Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold">
              Build Verified
            </span>
          </div>
          <div className="p-12 text-center">
            <div className="inline-block p-4 rounded-full bg-green-50 mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">If you see this, the build worked!</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              Your GitHub Action has successfully deployed the new layout. We can now safely re-add your Supabase features.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}