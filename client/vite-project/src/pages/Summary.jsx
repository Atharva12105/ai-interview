import { useLocation, useNavigate } from 'react-router-dom'

export default function Summary() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const s = state?.summary

  if (!s) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: '#9ca3af' }}>No summary found.</p>
      <button onClick={() => navigate('/')} style={{ background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8 }}>Go Home</button>
    </div>
  )

  const gradeColors = { A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', F: '#ef4444' }
  const verdictColors = { 'Strong Hire': '#22c55e', 'Hire': '#84cc16', 'Maybe': '#eab308', 'No Hire': '#ef4444' }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🎉 Interview Complete!</h1>

        {/* Score Card */}
        <div style={styles.scoreCard}>
          <div style={styles.bigScore}>{s.overallScore}<span style={{ fontSize: 24, color: '#9ca3af' }}>/100</span></div>
          <div style={{ fontSize: 48, fontWeight: 800, color: gradeColors[s.grade] || '#fff' }}>Grade {s.grade}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: verdictColors[s.verdict] || '#fff', marginTop: 8 }}>{s.verdict}</div>
        </div>

        {/* Summary */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Overall Assessment</h2>
          <p style={{ color: '#d1d5db', lineHeight: 1.8 }}>{s.summary}</p>
        </div>

        {/* Skill Bars */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📊 Skill Breakdown</h2>
          {[
            { label: 'Technical Proficiency', data: s.technicalProficiency },
            { label: 'Communication Skills', data: s.communicationSkills },
            { label: 'Problem Solving', data: s.problemSolvingAbility },
          ].map(({ label, data }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#e5e7eb' }}>{label}</span>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>{data?.score}/10</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: `${(data?.score || 0) * 10}%`, background: 'linear-gradient(90deg,#7c3aed,#2563eb)', borderRadius: 99, transition: 'width 1s' }} />
              </div>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{data?.comment}</p>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>✅ Strengths</h2>
            <ul style={{ paddingLeft: 20 }}>
              {s.strengths?.map((item, i) => <li key={i} style={{ color: '#86efac', marginBottom: 8, lineHeight: 1.5 }}>{item}</li>)}
            </ul>
          </div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🔧 Areas to Improve</h2>
            <ul style={{ paddingLeft: 20 }}>
              {s.areasForImprovement?.map((item, i) => <li key={i} style={{ color: '#fca5a5', marginBottom: 8, lineHeight: 1.5 }}>{item}</li>)}
            </ul>
          </div>
        </div>

        {/* Q Breakdown */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🗂️ Question Breakdown</h2>
          {s.questionBreakdown?.map((q, i) => (
            <div key={i} style={styles.qCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <p style={{ color: '#e5e7eb', flex: 1 }}>Q{i + 1}: {q.question}</p>
                <span style={{ color: '#a78bfa', fontWeight: 700, whiteSpace: 'nowrap' }}>{q.score}/10</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>{q.highlight}</p>
            </div>
          ))}
        </div>

        {/* Resources */}
        {s.recommendedResources?.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📚 Recommended Resources</h2>
            <ul style={{ paddingLeft: 20 }}>
              {s.recommendedResources.map((r, i) => <li key={i} style={{ color: '#93c5fd', marginBottom: 6 }}>{r}</li>)}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#fff', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
            🔄 Start New Interview
          </button>
          <button onClick={() => window.print()} style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', padding: 14, borderRadius: 12 }}>
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '40px 20px' },
  container: { maxWidth: 800, margin: '0 auto' },
  title: { textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 32, background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  scoreCard: { background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: 40, textAlign: 'center', marginBottom: 24 },
  bigScore: { fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1 },
  section: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#a78bfa', marginBottom: 16 },
  qCard: { background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }
}