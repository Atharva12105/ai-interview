// const mongoose = require('mongoose');

// const answerSchema = new mongoose.Schema({
//   questionId: Number,
//   question: String,
//   questionType: String,
//   transcription: String,
//   audioUrl: String,
//   evaluation: {
//     score: Number,
//     feedback: String,
//     strengths: [String],
//     improvements: [String],
//     keyPointsCovered: [String]
//   },
//   answeredAt: { type: Date, default: Date.now }
// });

// const interviewSessionSchema = new mongoose.Schema({
//   resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
//   candidateName: String,
//   status: { 
//     type: String, 
//     enum: ['pending', 'active', 'paused', 'completed'], 
//     default: 'pending' 
//   },
//   questions: [mongoose.Schema.Types.Mixed],
//   currentQuestionIndex: { type: Number, default: 0 },
//   answers: [answerSchema],
//   faceDetectionEvents: [{ 
//     event: String, // 'lost' | 'returned'
//     timestamp: Date 
//   }],
//   summary: mongoose.Schema.Types.Mixed,
//   startedAt: Date,
//   completedAt: Date,
// }, { timestamps: true });

// module.exports = mongoose.model('InterviewSession', interviewSessionSchema);

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: Number,
  question: String,
  questionType: String,
  transcription: String,
  audioUrl: String,
  evaluation: {
    score: Number,
    feedback: String,
    strengths: [String],
    improvements: [String],
    keyPointsCovered: [String]
  },
  answeredAt: { type: Date, default: Date.now }
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  candidateName: String,
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'completed'],
    default: 'pending'
  },
  questions: [mongoose.Schema.Types.Mixed],
  currentQuestionIndex: { type: Number, default: 0 },
  answers: [answerSchema],
  faceDetectionEvents: [{
    event: String,
    timestamp: Date
  }],
  summary: mongoose.Schema.Types.Mixed,
  startedAt: Date,
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);