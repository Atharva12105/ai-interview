const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
  candidateName: String,
  extractedData: {
    rawText: String,
    skills: String,
    experience: String,
    education: String,
    projects: String,
    name: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);