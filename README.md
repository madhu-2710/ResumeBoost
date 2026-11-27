# ResumeBoost – AI-Powered Resume Analyzer

ResumeBoost is an AI-powered resume analysis platform that helps job seekers understand and improve their resumes through actionable feedback.

Built for the **Toggle Wars: The Flagsmith Experimentation Hackathon**, ResumeBoost demonstrates how feature flags and A/B testing can be used to experiment with different user experiences and measure their impact.

## 🚀 Live Demo

- **Frontend:** https://resume-boost-green.vercel.app/
- **Backend:** https://resumeboost-u63n.onrender.com/

## ✨ Features

- **AI Resume Analysis:** Upload a PDF resume and receive AI-generated feedback.
- **Basic Feedback:** Get an overall resume score, summary, strengths, weaknesses, and recommendations.
- **Detailed Feedback:** Receive additional section-wise feedback, rewritten bullet points, missing keywords, and an improvement checklist.
- **Actionable Recommendations:** Identify areas that need improvement and track completed recommendations.
- **A/B Testing:** Experience different feedback interfaces through Flagsmith feature flags.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| AI Integration | Google Gemini API |
| PDF Processing | pdf-parse |
| Experimentation | Flagsmith |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

## 🧪 Flagsmith Experimentation

The main objective of ResumeBoost is to experiment with different resume feedback experiences and understand which approach encourages users to take action.

### Feature Flag

`resume_feedback_experience`

Two experiences are implemented:

| Experience | Description |
|---|---|
| Basic | Overall score, summary, strengths, weaknesses, and recommendations |
| Detailed | Basic feedback plus section-wise analysis, rewritten bullet points, missing keywords, and improvement checklist |

### Experiment Hypothesis

We believe that users who receive detailed, actionable resume feedback will be more likely to complete at least one recommended resume improvement than users who receive basic feedback.

We expect the Detailed variation to achieve a higher improvement completion rate than the Basic variation during the experiment.

### Experiment Configuration

- Environment: Production
- Traffic allocation: 100%
- Control: 50% – Basic experience
- Treatment: 50% – Detailed experience
- Primary metric: Resume Improvement Completion
- Measurement type: Occurrence
- Expected direction: Increase

### Success Metric

**Event:** `resume_improvement_completed`

The event is triggered when a user completes at least one recommended resume improvement action.

The application prevents repeated conversion events from being sent by the same browser using local storage.

### Preliminary Experiment Results

As of November 27, 2026:

| Variation | Exposures | Occurrence Rate |
|---|---:|---:|
| Control (Basic) | 1 | 0% |
| Detailed | 1 | 100% |

The experiment is actively collecting data. These early observations are not statistically significant and are not sufficient to declare a winning variation.

## 🏗️ Project Architecture

1. Users upload their resumes through the React frontend.
2. The frontend sends the PDF to the Express backend.
3. The backend extracts resume text using PDF parsing.
4. Google Gemini analyzes the extracted content.
5. The frontend displays the feedback according to the Flagsmith experiment variation.
6. When a user completes an improvement action, the application sends the conversion event to Flagsmith.

## ⚙️ Run Locally

### Prerequisites

- Node.js
- npm
- Google Gemini API key
- Flagsmith account and client-side environment key

### 1. Clone the repository

```bash
git clone https://github.com/madhu-2710/ResumeBoost
cd resumeboost
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_FLAGSMITH_ENVIRONMENT_ID=your_flagsmith_client_side_key
```

Never commit your actual API keys or secret credentials to GitHub.

### 4. Start the backend

```bash
npm run server
```

### 5. Start the frontend

Open another terminal:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🎯 Project Objective

ResumeBoost demonstrates how AI-powered applications can use feature flags and controlled experimentation to evaluate user experiences.

Rather than assuming that more detailed feedback is always better, the experiment measures whether providing additional guidance encourages users to complete recommended resume improvements.

---

**Built for the Toggle Wars: The Flagsmith Experimentation Hackathon.**