import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API } from '../context/AuthContext';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF resume first.');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await axios.post(`${API}/api/resume/upload`, formData, {
        headers: { ...getAuthHeaders() }
      });
      navigate(`/interview/${data.sessionId}`, {
        state: { candidateName: data.candidateName, totalQuestions: data.totalQuestions }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.grid} />
      <div style={s.glow} />

      {/* Top nav */}
      <div style={s.nav}>
        <div style={s.logoWrap}>
          <span style={s.logoIcon}>⬡</span>
          <span style={s.logoText}>InterviewAI</span>
        </div>
        <div style={s.navRight}>
          {user ? (
            <>
              <button onClick={() => navigate('/dashboard')} style={s.navBtn}>Dashboard</button>
              <button onClick={() => { logout(); }} style={s.navBtnOutline}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} style={s.navBtn}>Sign In</button>
              <button onClick={() => navigate('/auth')} style={s.navBtnPrimary}>Get Started</button>
            </>
          )}
        </div>
      </div>

      <div style={s.hero}>
        <div style={s.badge}>AI-Powered Interview Practice</div>
        <h1 style={s.title}>
          Ace your next<br />
          <span style={s.titleAccent}>interview</span>
        </h1>
        <p style={s.subtitle}>
          Upload your resume. Our AI generates personalized questions, evaluates your answers in real-time, and gives you a detailed performance report.
        </p>

        {/* Upload card */}
        <div style={s.card}>
          <div style={s.uploadBox}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}>
            {file ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                <p style={{ color: '#818cf8', fontWeight: 600, margin: 0 }}>{file.name}</p>
                <p style={{ color: '#4b5563', fontSize: 12, margin: '4px 0 0' }}>
                  {(file.size / 1024).toFixed(1)} KB · Ready to upload
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8, color: '#374151' }}>⤒</div>
                <p style={{ color: '#4b5563', margin: 0, fontWeight: 500 }}>Drop your PDF resume here</p>
                <p style={{ color: '#2d3148', fontSize: 12, margin: '4px 0 0' }}>or click to browse</p>
              </div>
            )}
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </div>

          {!user && (
            <p style={s.loginHint}>
              💡 <button onClick={() => navigate('/auth')} style={s.inlineLink}>Sign in</button> to save your interview history and track progress
            </p>
          )}

          {error && <div style={s.error}><span>⚠</span> {error}</div>}

          <button onClick={handleUpload} disabled={loading} style={s.cta}>
            {loading ? '⏳ Analyzing & Generating Questions...' : '▷  Start AI Interview'}
          </button>

          <div style={s.features}>
            {['🎥 Video on', '🎤 Voice answers', '👁 Face detection', '📊 AI report'].map(f => (
              <span key={f} style={s.feature}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes gridMove { from { transform: translateY(0); } to { transform: translateY(60px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    background: '#080810',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)`,
    backgroundSize: '60px 60px',
    animation: 'gridMove 10s linear infinite',
    pointerEvents: 'none',
  },
  glow: {
    position: 'fixed',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 700,
    height: 400,
    background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  nav: {
    position: 'relative',
    width: '100%',
    maxWidth: 1100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 22, color: '#6366f1' },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: 10 },
  navBtn: {
    padding: '9px 18px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  navBtnOutline: {
    padding: '9px 18px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#6b7280',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  navBtnPrimary: {
    padding: '9px 18px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  hero: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 24px 80px',
    maxWidth: 640,
    animation: 'fadeUp 0.6s ease',
  },
  badge: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6366f1',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    padding: '6px 16px',
    borderRadius: 99,
    marginBottom: 28,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 56,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.1,
    margin: '0 0 20px',
    letterSpacing: '-2px',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 1.7,
    marginBottom: 44,
    maxWidth: 480,
  },
  card: {
    width: '100%',
    background: 'rgba(12,12,24,0.85)',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: 24,
    padding: '32px',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
  },
  uploadBox: {
    border: '1.5px dashed rgba(99,102,241,0.25)',
    borderRadius: 16,
    padding: '36px 20px',
    marginBottom: 16,
    cursor: 'pointer',
    position: 'relative',
    transition: 'border-color 0.2s',
  },
  loginHint: {
    color: '#4b5563',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'left',
  },
  inlineLink: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: 0,
    textDecoration: 'underline',
  },
  error: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 14,
    display: 'flex',
    gap: 8,
    textAlign: 'left',
  },
  cta: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 20,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
    letterSpacing: '0.02em',
  },
  features: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  feature: { fontSize: 12, color: '#374151', fontWeight: 500 },
};