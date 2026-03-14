# 🤖 AI CV Analyzer

An intelligent resume analysis tool powered by AI. Upload your CV and get instant, detailed feedback to help you land your next job.

## ✨ Features

- 📄 **CV Upload** – Supports PDF and document uploads
- 🧠 **AI-Powered Analysis** – Deep analysis of your resume content
- 📊 **Detailed Feedback** – Strengths, weaknesses, and improvement suggestions
- 🎯 **Job Match Scoring** – See how well your CV fits a role
- ⚡ **Fast Results** – Get insights in seconds

## 🚀 Live Demo

[View on Vercel →](https://ai-cv-analyzer-gamma.vercel.app/)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | CSS |
| Backend | Vercel Serverless Functions |
| AI | Gemini API (Google) |
| Deployment | Vercel |

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API Key

### Installation
````bash
# Clone the repository
git clone https://github.com/celiikerenn/ai-cv-analyzer.git
cd ai-cv-analyzer

# Install dependencies
npm install
````

### Environment Variables

Create a `.env` file in the root directory:
````env
GEMINI_API_KEY=your_api_key_here
````

### Run Locally
````bash
npm run dev
````

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure
````
ai-cv-analyzer/
├── api/          # Vercel serverless functions
├── public/       # Static assets
├── src/          # React source code
├── index.html
├── vercel.json   # Vercel deployment config
└── vite.config.js
````

## 🚢 Deployment

This project is configured for one-click deployment on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/celiikerenn/ai-cv-analyzer)

Don't forget to add your `GEMINI_API_KEY` in Vercel's environment variables.

## 📄 License

MIT License © 2024 [celiikerenn](https://github.com/celiikerenn)
````

---

```bash
git add README.md
git commit -m "Update live demo link"
git push
```
