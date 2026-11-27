
import express from "express";
import cors from "cors";
import multer from "multer";
import { createRequire } from "node:module";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

app.get("/", (req, res) => {
  res.send("ResumeBoost Backend is running!");
});

app.post("/api/resume/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    // Extract text from uploaded PDF
    const data = await pdf(req.file.buffer);

    if (!data.text.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in this PDF.",
      });
    }

    // Get current date
    const currentDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Gemini prompt
    const prompt = `
You are an expert resume reviewer and career evaluator.

Today's date is ${currentDate}.

IMPORTANT DATE GUIDELINES:
- Use today's date when evaluating the resume timeline.
- Do not describe past dates as future dates.
- Only describe a date as future if it occurs after today's date.
- Do not assume that a current role or ongoing project has ended.

Analyse the resume carefully and independently.
Evaluate the actual content of this specific resume.
Do not reuse scores or feedback from previous resumes.

Resume:
${data.text}

EVALUATION CRITERIA:

1. Skills relevance and technical depth (20 points)
2. Projects and practical implementation (25 points)
3. Work experience and achievements (20 points)
4. Education and certifications (10 points)
5. Resume clarity, structure and presentation (15 points)
6. Impact, measurable results and overall quality (10 points)

Calculate the total score out of 100 based on these criteria.

The score must reflect the actual quality of the submitted resume.
Do not assign a default score or copy an example score.
Different resumes must receive scores according to their individual strengths and weaknesses.

Give realistic, specific, constructive and fair feedback based only on the resume.

IMPORTANT FAIRNESS GUIDELINES:

- Evaluate candidates based on demonstrated skills, practical experience, projects, achievements and relevant knowledge.
- Do not automatically penalize candidates for having a degree outside Computer Science or a different academic background.
- Consider practical software engineering experience and technical achievements when evaluating candidates from non-CS backgrounds.
- Evaluate education based on the qualifications actually listed, without assuming that a different degree means a lack of technical ability.
- If a candidate has limited professional experience, recognize relevant academic projects, personal projects, internships and practical contributions.
- Mention gaps only when they are genuinely relevant to the target role.
- Phrase weaknesses constructively and provide actionable recommendations.
- Never make assumptions about a candidate's abilities based solely on their degree, institution or career background.

IMPORTANT VISUAL ANNOTATION GUIDELINES:

- Identify specific sentences or bullet points directly from the original resume.
- Return exact text copied from the original resume in the quote field.
- Do not invent, rewrite or paraphrase the quote field.
- Use "strength" for well-written and impactful content.
- Use "needs_improvement" for vague, weak or unclear content.
- For weak content, provide an improved version in suggestion.
- Keep the original meaning.
- Never invent achievements, skills, numbers, responsibilities or experience.
- Include only useful annotations, not every sentence.
- Return between 3 and 8 annotations when sufficient relevant content exists.
- If an exact sentence cannot be identified, do not create an annotation for it.
- For strength annotations, leave suggestion as an empty string.
- Make annotations specific and useful for the candidate.

RETURN VALID JSON ONLY.

Use this exact JSON structure:

{
  "score": 0,
  "summary": "A short overall assessment",

  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],

  "weaknesses": [
    "Weakness 1",
    "Weakness 2",
    "Weakness 3"
  ],

  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],

  "sectionFeedback": {
    "skills": "Feedback about the skills section",
    "projects": "Feedback about the projects section",
    "experience": "Feedback about the experience section",
    "education": "Feedback about the education section"
  },

  "rewrittenBullets": [
    "Improved resume bullet point 1"
  ],

  "missingKeywords": [
    "Keyword 1",
    "Keyword 2"
  ],

  "checklist": [
    "Improvement action 1",
    "Improvement action 2"
  ],

  "annotations": [
    {
      "type": "strength",
      "quote": "Exact sentence copied from the original resume",
      "reason": "Why this sentence is strong",
      "suggestion": ""
    },
    {
      "type": "needs_improvement",
      "quote": "Exact sentence copied from the original resume",
      "reason": "Why this sentence needs improvement",
      "suggestion": "Improved version of the sentence"
    }
  ]
}

The score must be an integer between 0 and 100.
Do not include Markdown or explanations outside the JSON.
`;

    // Generate AI analysis
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const analysis = JSON.parse(response.text);

    // Send analysis to frontend
    res.json({
      success: true,
      message: "Resume analysed successfully!",
      fileName: req.file.originalname,
      analysis,
    });

  } catch (error) {
    console.error("Resume processing error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process the resume.",
    });
  }
});

// Error handling
app.use((error, req, res, next) => {
  res.status(400).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ResumeBoost backend running on port ${PORT}`);
});
