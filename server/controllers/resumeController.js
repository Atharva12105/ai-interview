const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');
const { extractResumeData } = require('../services/pdfParser');
const { generateInterviewQuestions } = require('../services/aiService');

const uploadResume = async (req, res) => {
  try {
    const resumeData = await extractResumeData(req.file.path);

    const resume = await Resume.create({
      fileName: req.file.filename,
      filePath: req.file.path,
      extractedData: resumeData,
      candidateName: resumeData.name,
      userId: req.userId || null,
    });

    const questions = await generateInterviewQuestions(resumeData);

    const session = await InterviewSession.create({
      resumeId: resume._id,
      candidateName: resumeData.name,
      questions,
      status: 'pending',
      userId: req.userId || null,
    });

    res.json({
      success: true,
      resumeId: resume._id,
      sessionId: session._id,
      candidateName: resumeData.name,
      totalQuestions: questions.length,
      firstQuestion: questions[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getResumeData = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadResume, getResumeData };