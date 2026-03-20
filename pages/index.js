import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      padding: '50px', 
      fontFamily: 'system-ui, sans-serif', 
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{ color: '#0f172a', fontSize: '36px', fontWeight: '900', marginBottom: '10px' }}>
          NamLogix Africa
        </h1>
        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '30px' }}>
          Inventory System Deployment
        </p>
        
        <div style={{ 
          background: '#f0fdf4', 
          border: '2px solid #22c55e', 
          padding: '20px', 
          borderRadius: '16px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#16a34a', margin: '0' }}>✅ BUILD SUCCESSFUL</h2>
          <p style={{ color: '#166534', margin: '10px 0 0 0', fontWeight: '500' }}>
            If you see this, the GitHub Action finally worked!
          </p>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Once this turns green, we will re-add your Supabase tables.
        </p>
      </div>
    </div>
  );
}