const fs = require('fs');
const PDFParser = require('pdf2json');

const extractResumeData = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', err => reject(err));

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      // Extract raw text from all pages
      let fullText = '';
      pdfData.Pages.forEach(page => {
        page.Texts.forEach(textItem => {
          textItem.R.forEach(r => {
            fullText += decodeURIComponent(r.T) + ' ';
          });
          fullText += '\n';
        });
        fullText += '\n';
      });

      const resumeData = {
        rawText: fullText,
        skills: extractSkills(fullText),
        experience: extractExperience(fullText),
        education: extractEducation(fullText),
        projects: extractProjects(fullText),
        name: extractName(fullText),
      };

      resolve(resumeData);
    });

    pdfParser.loadPDF(filePath);
  });
};

const extractSkills = (text) => {
  const match = text.match(/skills?[:\s]*([\s\S]*?)(?=experience|education|projects|$)/i);
  return match ? match[1].trim().slice(0, 500) : '';
};

const extractExperience = (text) => {
  const match = text.match(/experience[:\s]*([\s\S]*?)(?=education|skills|projects|$)/i);
  return match ? match[1].trim().slice(0, 1000) : '';
};

const extractEducation = (text) => {
  const match = text.match(/education[:\s]*([\s\S]*?)(?=experience|skills|projects|$)/i);
  return match ? match[1].trim().slice(0, 500) : '';
};

const extractProjects = (text) => {
  const match = text.match(/projects?[:\s]*([\s\S]*?)(?=experience|skills|education|$)/i);
  return match ? match[1].trim().slice(0, 500) : '';
};

const extractName = (text) => {
  const firstLine = text.split('\n').find(line => line.trim().length > 2);
  return firstLine ? firstLine.trim().slice(0, 50) : 'Candidate';
};

module.exports = { extractResumeData };