// server/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Generate Interview Questions from Resume ───────────────────────────────
const generateInterviewQuestions = async (resumeData) => {
  const prompt = `You are an expert technical interviewer. Based on the following resume, generate 1 interview questions specific to this candidate.

Resume:
- Name: ${resumeData.name}
- Skills: ${resumeData.skills}
- Experience: ${resumeData.experience}
- Education: ${resumeData.education}
- Projects: ${resumeData.projects}

Generate exactly 1 technical question.

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "id": 1,
    "question": "...",
    "type": "technical",
    "expectedKeyPoints": ["point1", "point2"]
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Strip markdown code fences if present
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// ─── Evaluate a Candidate's Answer ─────────────────────────────────────────
const evaluateAnswer = async (question, answer, expectedKeyPoints) => {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: ${question}
Expected Key Points: ${expectedKeyPoints.join(', ')}
Candidate's Answer: ${answer || '(No answer provided)'}

Return ONLY valid JSON, no markdown:
{
  "score": 7,
  "feedback": "Good understanding shown...",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1"],
  "keyPointsCovered": ["point covered"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// ─── Generate Final Interview Summary ──────────────────────────────────────
const generateFinalSummary = async (sessionData) => {
  const qa = sessionData.answers.map((a, i) => `
Q${i + 1}: ${a.question}
Answer: ${a.transcription || '(No answer)'}
Score: ${a.evaluation?.score ?? 'N/A'}/10
Feedback: ${a.evaluation?.feedback ?? ''}
`).join('\n');

  const prompt = `You are an expert interviewer. Generate a full interview report.

Candidate: ${sessionData.candidateName}
Total Questions: ${sessionData.answers.length}

${qa}

Return ONLY valid JSON, no markdown:
{
  "overallScore": 75,
  "grade": "B",
  "verdict": "Hire",
  "summary": "2-3 paragraph assessment...",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "technicalProficiency": { "score": 8, "comment": "..." },
  "communicationSkills": { "score": 7, "comment": "..." },
  "problemSolvingAbility": { "score": 7, "comment": "..." },
  "recommendedResources": ["resource1", "resource2"],
  "questionBreakdown": [
    { "question": "...", "score": 8, "highlight": "..." }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { generateInterviewQuestions, evaluateAnswer, generateFinalSummary };