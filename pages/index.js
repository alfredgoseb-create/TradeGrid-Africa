import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <header style={{ 
        borderBottom: '2px solid #3b82f6', 
        marginBottom: '30px', 
        paddingBottom: '20px' 
      }}>
        <h1 style={{ color: '#1e3a8a', fontSize: '36px', fontWeight: '900', margin: '0' }}>
          NamLogix Africa
        </h1>
        <p style={{ color: '#64748b', fontSize: '18px', marginTop: '8px' }}>
          Inventory Management System v3.0
        </p>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        <div style={{ 
          background: '#eff6ff', 
          padding: '30px', 
          borderRadius: '20px', 
          border: '1px solid #bfdbfe',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
        }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            Build Status
          </p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', margin: '0' }}>
            ✅ SUCCESS
          </p>
        </div>

        <div style={{ 
          background: '#f8fafc', 
          padding: '30px', 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
        }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            Environment
          </p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '0' }}>
            Node.js 22
          </p>
        </div>
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '40px', 
        background: '#f0fdf4', 
        borderRadius: '24px', 
        border: '2px dashed #22c55e', 
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#166534', margin: '0 0 10px 0' }}>The Pipeline is Fixed!</h2>
        <p style={{ color: '#15803d', fontSize: '18px' }}>
          GitHub is now using the correct Node version. Your changes are live.
        </p>
      </div>
    </div>
  );
}