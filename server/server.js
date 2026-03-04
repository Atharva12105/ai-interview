const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

// Routes
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
// Add after your routes
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});
// Socket.io for real-time interview
io.on('connection', (socket) => {
  console.log('Candidate connected:', socket.id);

  socket.on('candidate-answer', async ({ sessionId, answer, questionIndex }) => {
    // Process answer and emit next question
    const { nextQuestion, isComplete } = await processAnswer(sessionId, answer, questionIndex);
    
    if (isComplete) {
      const summary = await generateSummary(sessionId);
      socket.emit('interview-complete', { summary });
    } else {
      socket.emit('next-question', { question: nextQuestion, index: questionIndex + 1 });
    }
  });

  socket.on('face-lost', ({ sessionId }) => {
    socket.emit('interview-paused', { 
      message: 'Please return to the screen. Interview is paused.' 
    });
  });

  socket.on('face-returned', ({ sessionId }) => {
    socket.emit('interview-resumed', { 
      message: 'Welcome back! Continuing interview...' 
    });
  });

  socket.on('disconnect', () => {
    console.log('Candidate disconnected:', socket.id);
  });
});

server.listen(8000, () => console.log('Server running on port 8000'));