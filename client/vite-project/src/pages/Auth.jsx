import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name) return setError('Name is required');
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div style={s.page}>
      {/* Animated background grid */}
      <div style={s.grid} />
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>⬡</div>
          <span style={s.logoText}>InterviewAI</span>
        </div>

        <h1 style={s.heading}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={s.subhead}>
          {mode === 'login'
            ? 'Sign in to access your interview history'
            : 'Start your AI-powered interview journey'}
        </p>

        {/* Toggle */}
        <div style={s.toggle}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ ...s.toggleBtn, ...(mode === m ? s.toggleActive : {}) }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={s.fields}>
          {mode === 'register' && (
            <div style={s.fieldWrap}>
              <label style={s.label}>Full Name</label>
              <input value={form.name} onChange={f('name')} placeholder="Alex Johnson"
                style={s.input} onKeyDown={e => e.key === 'Enter' && handle()} />
            </div>
          )}
          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input value={form.email} onChange={f('email')} placeholder="you@example.com"
              type="email" style={s.input} onKeyDown={e => e.key === 'Enter' && handle()} />
          </div>
          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <input value={form.password} onChange={f('password')} placeholder="••••••••"
              type="password" style={s.input} onKeyDown={e => e.key === 'Enter' && handle()} />
          </div>
        </div>

        {error && (
          <div style={s.error}>
            <span>⚠</span> {error}
          </div>
        )}

        <button onClick={handle} disabled={loading} style={s.cta}>
          {loading
            ? <span style={s.spinner}>◌</span>
            : mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>

        <button onClick={() => navigate('/')} style={s.guestBtn}>
          Continue without account
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #3d4058; }
        input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gridMove { from { transform: translateY(0); } to { transform: translateY(60px); } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#080810',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: 20,
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    animation: 'gridMove 8s linear infinite',
  },
  glow1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: 600,
    height: 600,
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  glow2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: 500,
    height: 500,
    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  card: {
    position: 'relative',
    background: 'rgba(12,12,24,0.9)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 24,
    padding: '48px 44px',
    width: '100%',
    maxWidth: 440,
    backdropFilter: 'blur(24px)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
    animation: 'fadeUp 0.5s ease',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 28,
    color: '#6366f1',
    lineHeight: 1,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 20,
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },
  subhead: {
    color: '#5a5f7a',
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 28,
  },
  toggle: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: '9px 0',
    border: 'none',
    borderRadius: 9,
    background: 'transparent',
    color: '#5a5f7a',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  },
  toggleActive: {
    background: '#6366f1',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  fields: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#fca5a5',
    fontSize: 14,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  cta: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
    transition: 'opacity 0.2s, transform 0.2s',
    letterSpacing: '0.02em',
  },
  guestBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#5a5f7a',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, color 0.2s',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
};