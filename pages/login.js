import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontWeight: '900', fontSize: '28px' }}>NamLogix <span style={{color:'#2563eb'}}>AFRICA</span></h1>
        <p style={{ color: '#64748b' }}>Secure Staff Portal</p>
      </div>
      
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
          <input 
            type="email" 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Password</label>
          <input 
            type="password" 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button disabled={loading} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}