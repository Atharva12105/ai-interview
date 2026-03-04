const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadResume, getResumeData } = require('../controllers/resumeController');

// Optional auth — attaches userId if token present, continues either way
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_change_this');
      req.userId = decoded.userId;
    } catch { /* no token or invalid — proceed as guest */ }
  }
  next();
};

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', optionalAuth, upload.single('resume'), uploadResume);
router.get('/:id', getResumeData);

module.exports = router;