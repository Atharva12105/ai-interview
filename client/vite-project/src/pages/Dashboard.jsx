import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/interview/dashboard`, { headers: getAuthHeaders() })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const gradeColor = { A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', F: '#ef4444' };
  const verdictColor = { 'Strong Hire': '#22c55e', 'Hire': '#84cc16', 'Maybe': '#eab308', 'No Hire': '#ef4444' };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { from { background-position: -200px 0; } to { background-position: 200px 0; } }
        .session-row:hover { background: rgba(99,102,241,0.08) !important; }
        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,0.4) !important; }
        .logout-btn:hover { color: #ef4444 !important; border-color: rgba(239,68,68,0.3) !important; }
      `}</style>

      {/* Sidebar */}
      <nav style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoWrap}>
            <span style={s.logoIcon}>⬡</span>
            <span style={s.logoText}>InterviewAI</span>
          </div>

          <div style={s.navLinks}>
            {[
              { icon: '◈', label: 'Dashboard', active: true },
              { icon: '▷', label: 'New Interview', action: () => navigate('/') },
              { icon: '◎', label: 'History', active: false },
            ].map(({ icon, label, active, action }) => (
              <button key={label} onClick={action}
                style={{ ...s.navLink, ...(active ? s.navLinkActive : {}) }}>
                <span style={s.navIcon}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={s.sideBottom}>
          <div style={s.userChip}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#4b5563' }}>{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/auth'); }}
            style={s.logoutBtn}>
            ⎋ Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.greeting}>Good day, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={s.greetSub}>Here's your interview performance overview</p>
          </div>
          <button className="start-btn" onClick={() => navigate('/')}
            style={s.startBtn}>
            + New Interview
          </button>
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={s.skeleton} />
            ))}
          </div>
        ) : !data ? (
          <div style={s.empty}>Failed to load data. Please refresh.</div>
        ) : (
          <>
            {/* Stats row */}
            <div style={s.statsGrid}>
              {[
                { label: 'Total Interviews', value: data.stats.totalInterviews, icon: '◈', accent: '#6366f1' },
                { label: 'Average Score', value: `${data.stats.avgScore}%`, icon: '◎', accent: '#8b5cf6' },
                { label: 'Best Score', value: `${data.stats.bestScore}%`, icon: '★', accent: '#06b6d4' },
                { label: 'Top Grade', value: Object.entries(data.stats.gradeCount).sort(([,a],[,b])=>b-a)[0]?.[0] || 'N/A', icon: '◆', accent: '#10b981' },
              ].map(({ label, value, icon, accent }, i) => (
                <div key={label} style={{ ...s.statCard, animationDelay: `${i * 0.08}s` }}>
                  <div style={{ ...s.statIcon, color: accent, background: `${accent}15` }}>{icon}</div>
                  <div style={{ ...s.statValue, color: accent }}>{value}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Grade breakdown */}
            {data.stats.totalInterviews > 0 && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Grade Distribution</h2>
                <div style={s.gradeRow}>
                  {Object.entries(data.stats.gradeCount).map(([grade, count]) => (
                    <div key={grade} style={s.gradeChip}>
                      <div style={{ ...s.gradeCircle, borderColor: gradeColor[grade] || '#fff', color: gradeColor[grade] || '#fff' }}>
                        {grade}
                      </div>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session detail panel */}
            {selectedSession && (
              <div style={s.detailPanel}>
                <div style={s.detailHeader}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                      Interview Details
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>{formatDate(selectedSession.completedAt)}</p>
                  </div>
                  <button onClick={() => setSelectedSession(null)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 20, cursor: 'pointer' }}>×</button>
                </div>

                <div style={s.detailScoreRow}>
                  <div style={s.detailBigScore}>
                    <span style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>{selectedSession.overallScore}</span>
                    <span style={{ fontSize: 18, color: '#6b7280' }}>/100</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: gradeColor[selectedSession.grade] || '#fff', fontFamily: "'Syne', sans-serif" }}>
                      {selectedSession.grade}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: verdictColor[selectedSession.verdict] || '#fff' }}>
                      {selectedSession.verdict}
                    </div>
                  </div>
                </div>

                <div style={s.skillBars}>
                  {[
                    { label: 'Technical', score: selectedSession.technicalScore, color: '#6366f1' },
                    { label: 'Communication', score: selectedSession.communicationScore, color: '#8b5cf6' },
                    { label: 'Problem Solving', score: selectedSession.problemSolvingScore, color: '#06b6d4' },
                  ].map(({ label, score, color }) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: '#9ca3af' }}>{label}</span>
                        <span style={{ color, fontWeight: 700 }}>{score}/10</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${score * 10}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past interviews table */}
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Past Interviews</h2>

              {data.sessions.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
                  <p style={{ color: '#6b7280', marginBottom: 20 }}>No completed interviews yet.</p>
                  <button onClick={() => navigate('/')} style={s.startBtn}>Start Your First Interview</button>
                </div>
              ) : (
                <div style={s.table}>
                  <div style={s.tableHead}>
                    <span style={{ flex: 2 }}>Date</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Questions</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Score</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Grade</span>
                    <span style={{ flex: 2 }}>Verdict</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Details</span>
                  </div>

                  {data.sessions.map((session, i) => (
                    <div key={session.id} className="session-row"
                      style={{ ...s.tableRow, animationDelay: `${i * 0.05}s` }}>
                      <span style={{ flex: 2, color: '#e5e7eb', fontSize: 14 }}>
                        {formatDate(session.completedAt)}
                      </span>
                      <span style={{ flex: 1, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                        {session.totalQuestions}
                      </span>
                      <span style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: session.overallScore >= 70 ? '#22c55e' : session.overallScore >= 50 ? '#eab308' : '#ef4444'
                        }}>
                          {session.overallScore}
                        </span>
                        <span style={{ color: '#4b5563', fontSize: 12 }}>/100</span>
                      </span>
                      <span style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: 16,
                          fontFamily: "'Syne', sans-serif",
                          color: gradeColor[session.grade] || '#fff'
                        }}>
                          {session.grade}
                        </span>
                      </span>
                      <span style={{ flex: 2 }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 99,
                          background: `${verdictColor[session.verdict] || '#6b7280'}18`,
                          color: verdictColor[session.verdict] || '#6b7280',
                          border: `1px solid ${verdictColor[session.verdict] || '#6b7280'}30`,
                        }}>
                          {session.verdict}
                        </span>
                      </span>
                      <span style={{ flex: 1, textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                          style={s.viewBtn}>
                          {selectedSession?.id === session.id ? 'Hide' : 'View'}
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#080810',
    fontFamily: "'DM Sans', sans-serif",
    color: '#fff',
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: 'rgba(255,255,255,0.02)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '28px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sideTop: { display: 'flex', flexDirection: 'column', gap: 32 },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' },
  logoIcon: { fontSize: 22, color: '#6366f1' },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' },
  navLinks: { display: 'flex', flexDirection: 'column', gap: 4 },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    background: 'none',
    border: 'none',
    color: '#4b5563',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
    width: '100%',
  },
  navLinkActive: { background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  sideBottom: { display: 'flex', flexDirection: 'column', gap: 12 },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  logoutBtn: {
    padding: '9px 12px',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: '#4b5563',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    padding: '40px 48px',
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  greeting: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  greetSub: { color: '#4b5563', fontSize: 14, margin: '6px 0 0' },
  startBtn: {
    padding: '12px 22px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
    transition: 'all 0.25s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '24px 20px',
    animation: 'fadeUp 0.4s ease both',
  },
  statIcon: {
    fontSize: 20,
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 800,
    fontFamily: "'Syne', sans-serif",
    lineHeight: 1,
    marginBottom: 6,
  },
  statLabel: { fontSize: 12, color: '#4b5563', fontWeight: 500 },
  section: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: '28px 28px',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: '#9ca3af',
    margin: '0 0 20px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  gradeRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  gradeChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  gradeCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 16,
  },
  table: { display: 'flex', flexDirection: 'column', gap: 0 },
  tableHead: {
    display: 'flex',
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    marginBottom: 4,
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: 12,
    cursor: 'default',
    transition: 'background 0.15s',
    animation: 'fadeUp 0.3s ease both',
  },
  viewBtn: {
    padding: '5px 14px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 8,
    color: '#818cf8',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },
  detailPanel: {
    background: 'rgba(99,102,241,0.06)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    animation: 'fadeUp 0.3s ease',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    fontFamily: "'Syne', sans-serif",
  },
  detailScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  detailBigScore: { display: 'flex', alignItems: 'baseline', gap: 4 },
  skillBars: {},
  loadingWrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  skeleton: {
    height: 80,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 16,
  },
  empty: { color: '#6b7280', textAlign: 'center', padding: 40 },
  emptyState: { textAlign: 'center', padding: '40px 0' },
};