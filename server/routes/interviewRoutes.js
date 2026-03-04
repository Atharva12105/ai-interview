const express = require('express');
const router = express.Router();
const InterviewSession = require('../models/InterviewSession');
const { evaluateAnswer, generateFinalSummary } = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

// GET /api/interview/session/:id — load session
router.get('/session/:id', async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interview/answer — submit an answer
router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer, questionIndex } = req.body;
    const session = await InterviewSession.findById(sessionId);

    const question = session.questions[questionIndex];
    const evaluation = await evaluateAnswer(
      question.question,
      answer,
      question.expectedKeyPoints
    );

    session.answers.push({
      questionId: question.id,
      question: question.question,
      questionType: question.type,
      transcription: answer,
      evaluation
    });

    const isComplete = questionIndex >= session.questions.length - 1;

    if (isComplete) {
      session.status = 'completed';
      session.completedAt = new Date();
      const summary = await generateFinalSummary({
        candidateName: session.candidateName,
        answers: session.answers
      });
      session.summary = summary;
      await session.save();
      return res.json({ isComplete: true, summary });
    }

    session.currentQuestionIndex = questionIndex + 1;
    await session.save();

    res.json({ isComplete: false, nextQuestion: session.questions[questionIndex + 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interview/dashboard — user stats + past interviews (auth required)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.userId,
      status: 'completed'
    }).sort({ completedAt: -1 });

    const totalInterviews = sessions.length;
    const avgScore = totalInterviews
      ? Math.round(sessions.reduce((sum, s) => sum + (s.summary?.overallScore || 0), 0) / totalInterviews)
      : 0;

    const bestScore = totalInterviews
      ? Math.max(...sessions.map(s => s.summary?.overallScore || 0))
      : 0;

    const gradeCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    sessions.forEach(s => {
      const g = s.summary?.grade;
      if (g && gradeCount[g] !== undefined) gradeCount[g]++;
    });

    const recentSessions = sessions.slice(0, 10).map(s => ({
      id: s._id,
      candidateName: s.candidateName,
      completedAt: s.completedAt,
      overallScore: s.summary?.overallScore || 0,
      grade: s.summary?.grade || 'N/A',
      verdict: s.summary?.verdict || 'N/A',
      totalQuestions: s.questions?.length || 0,
      technicalScore: s.summary?.technicalProficiency?.score || 0,
      communicationScore: s.summary?.communicationSkills?.score || 0,
      problemSolvingScore: s.summary?.problemSolvingAbility?.score || 0,
    }));

    res.json({
      stats: { totalInterviews, avgScore, bestScore, gradeCount },
      sessions: recentSessions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interview/session-detail/:id — full session with summary for past interview view
router.get('/session-detail/:id', authMiddleware, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.userId });
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;