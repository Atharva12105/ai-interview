import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useFaceDetection } from '../hooks/useFaceDetection'

export default function Interview() {
  const { sessionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const streamRef = useRef(null)

  const [status, setStatus] = useState('loading') // loading|active|paused|submitting
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(state?.totalQuestions || 0)
  const [isAnswering, setIsAnswering] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [timeLeft, setTimeLeft] = useState(120)
  const timerRef = useRef(null)

  const {
    videoRef,
    facePresent,
    faceCount,
    multipleFaces,
    eyesOpen,
    modelLoaded,
    modelError,
    startDetection,
    stopDetection
  } = useFaceDetection({ enabled: status === 'active' })

  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onTranscript: (t) => setAnswerText(t)
  })

  const speak = useCallback((text, onDone) => {
    speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.92
    utter.pitch = 1.05
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
    if (preferred) utter.voice = preferred
    utter.onstart = () => setAiSpeaking(true)
    utter.onend = () => { setAiSpeaking(false); onDone?.() }
    speechSynthesis.speak(utter)
  }, [])

  const askQuestion = useCallback((question, index) => {
    setCurrentQuestion(question)
    setQuestionIndex(index)
    setIsAnswering(false)
    resetTranscript()
    setAnswerText('')
    setTimeLeft(120)
    speak(`Question ${index + 1}. ${question.question}`, () => {
      setIsAnswering(true)
      startListening()
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
          return t - 1
        })
      }, 1000)
    })
  }, [speak, startListening, resetTranscript])

  useEffect(() => {
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })

    // Load session
    axios.get(`http://localhost:8000/api/interview/session/${sessionId}`)
      .then(({ data }) => {
        setTotalQuestions(data.questions.length)
        setStatus('active')
        speak(`Hello ${data.candidateName}! Welcome to your AI interview. I will ask you ${data.questions.length} questions based on your resume. Please answer clearly into your microphone. Let's begin!`, () => {
          askQuestion(data.questions[0], 0)
        })
      })

    return () => {
      speechSynthesis.cancel()
      streamRef.current?.getTracks().forEach(t => t.stop())
      stopDetection()
      clearInterval(timerRef.current)
    }
  }, [sessionId])

  useEffect(() => {
    if (status === 'active' && modelLoaded) startDetection()
    else stopDetection()
    return () => stopDetection()
  }, [status, modelLoaded, startDetection, stopDetection])

  const handleSubmit = useCallback(async (auto = false) => {
    clearInterval(timerRef.current)
    const answer = stopListening() || answerText
    if (!answer && !auto) return
    setIsAnswering(false)
    setStatus('submitting')

    try {
      const { data } = await axios.post('http://localhost:8000/api/interview/answer', {
        sessionId, answer, questionIndex
      })

      if (data.isComplete) {
        speak('Thank you! Your interview is complete. Generating your report now.', () => {
          streamRef.current?.getTracks().forEach(t => t.stop())
          navigate('/summary', { state: { summary: data.summary } })
        })
      } else {
        setStatus('active')
        askQuestion(data.nextQuestion, questionIndex + 1)
      }
    } catch (err) {
      console.error(err)
      setStatus('active')
    }
  }, [answerText, questionIndex, sessionId, stopListening, speak, navigate, askQuestion])

  const progress = totalQuestions ? ((questionIndex) / totalQuestions) * 100 : 0
  const eyeIssue = facePresent && !eyesOpen
  const proctoringOk = facePresent && !multipleFaces && eyesOpen
  const shouldShowOverlay = !proctoringOk
  const proctoringLabel = !facePresent
    ? '❌ No Face Detected'
    : multipleFaces
      ? `⚠️ Multiple Faces (${faceCount})`
      : eyeIssue
        ? '⚠️ Eyes Not Clearly Visible'
        : '✅ Proctoring OK'

  const overlayText = !facePresent
    ? '⚠️ Face not detected.\nPlease stay in front of the camera.'
    : multipleFaces
      ? `⚠️ ${faceCount} faces detected.\nOnly one candidate should be visible.`
      : '⚠️ Keep your eyes visible to camera.'

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>🤖 AI Interviewer</span>
        <div style={styles.progressWrap}>
          <span style={{ color: '#9ca3af', fontSize: 14 }}>Question {questionIndex + 1} of {totalQuestions}</span>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        </div>
        <div style={{ ...styles.faceBadge, background: proctoringOk ? '#16a34a33' : '#dc262633', border: `1px solid ${proctoringOk ? '#16a34a' : '#dc2626'}` }}>
          {proctoringLabel}
        </div>
      </div>

      <div style={styles.main}>
        {/* Video */}
        <div style={styles.videoWrap}>
          <video ref={videoRef} autoPlay muted style={styles.video} />
          {shouldShowOverlay && (
            <div style={styles.pauseOverlay}>
              {overlayText.split('\n')[0]}<br />{overlayText.split('\n')[1]}
            </div>
          )}
          {modelError && (
            <div style={styles.modelError}>
              {modelError}
            </div>
          )}
        </div>

        {/* AI Panel */}
        <div style={styles.aiPanel}>
          <div style={{ ...styles.aiAvatar, animation: aiSpeaking ? 'pulse 1s infinite' : 'none' }}>
            <span style={{ fontSize: 48 }}>🤖</span>
            {aiSpeaking && <div style={styles.speakingDots}><span/>.<span/>.<span/>.</div>}
          </div>

          <div style={styles.questionCard}>
            <div style={styles.questionType}>{currentQuestion?.type?.toUpperCase() || 'LOADING'}</div>
            <p style={styles.questionText}>
              {status === 'loading' ? 'Loading your interview...' : currentQuestion?.question || ''}
            </p>
          </div>

          {isAnswering && (
            <div style={styles.answerSection}>
              <div style={styles.timerRow}>
                <span style={{ color: timeLeft < 30 ? '#ef4444' : '#9ca3af', fontSize: 14 }}>
                  ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} remaining
                </span>
                <span style={{ ...styles.micBadge, background: isListening ? '#dc262622' : '#ffffff11' }}>
                  {isListening ? '🔴 Recording' : '⏸ Paused'}
                </span>
              </div>

              <div style={styles.transcriptBox}>
                <p style={{ color: answerText ? '#e5e7eb' : '#4b5563', fontSize: 15, lineHeight: 1.6 }}>
                  {answerText || 'Start speaking — your answer will appear here...'}
                </p>
              </div>

              <button onClick={() => handleSubmit(false)} style={styles.submitBtn}
                disabled={status === 'submitting'}>
                {status === 'submitting' ? '⏳ Processing...' : '✅ Submit Answer →'}
              </button>
            </div>
          )}

          {status === 'submitting' && (
            <div style={{ textAlign: 'center', color: '#a78bfa', padding: 20 }}>
              ⏳ AI is evaluating your answer...
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f1a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' },
  logo: { fontSize: 20, fontWeight: 700, color: '#a78bfa' },
  progressWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, maxWidth: 300, margin: '0 32px' },
  progressBar: { width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', borderRadius: 99, transition: 'width 0.5s' },
  faceBadge: { padding: '6px 12px', borderRadius: 99, fontSize: 13 },
  main: { display: 'flex', flex: 1, gap: 24, padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' },
  videoWrap: { position: 'relative', width: 380, flexShrink: 0 },
  video: { width: '100%', borderRadius: 16, border: '2px solid rgba(255,255,255,0.1)', background: '#000', aspectRatio: '4/3', objectFit: 'cover' },
  pauseOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fbbf24', fontSize: 18, fontWeight: 600, lineHeight: 1.6 },
  modelError: { marginTop: 10, color: '#fca5a5', fontSize: 12, lineHeight: 1.4 },
  aiPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: 20 },
  aiAvatar: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16 },
  speakingDots: { color: '#a78bfa', fontSize: 20, letterSpacing: 2 },
  questionCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24 },
  questionType: { fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: 2, marginBottom: 12 },
  questionText: { fontSize: 20, lineHeight: 1.6, color: '#f3f4f6', fontWeight: 500 },
  answerSection: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 },
  timerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  micBadge: { padding: '4px 12px', borderRadius: 99, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)' },
  transcriptBox: { minHeight: 100, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' },
  submitBtn: { background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '13px 24px', fontSize: 16, borderRadius: 12, width: '100%' }
}
