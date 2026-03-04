import { useState, useRef, useCallback } from 'react'

export const useSpeechRecognition = ({ onTranscript } = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)
  const finalRef = useRef('')

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Use Chrome for speech recognition.'); return }

    finalRef.current = ''
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      const full = finalRef.current + interim
      setTranscript(full)
      onTranscript?.(full)
    }

    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }, [onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    return finalRef.current
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    finalRef.current = ''
  }, [])

  return { isListening, transcript, startListening, stopListening, resetTranscript }
}