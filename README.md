# JobMatch Backend API

This is the Node.js/Express backend for JobMatch, a next-generation recruitment platform powered by Google Gemini.

## Features
- **AI Resume Parsing**: Upload a PDF and automatically extract skills, education, and achievements using Google Gemini Flash Lite.
- **AI Job Generation**: Recruiters can describe a job in plain English, and the AI will auto-fill the form with ATS requirements.
- **ATS Match Scoring**: Analyzes a seeker's resume against a job description, computing a match score and actionable feedback.
- **Role-Based Access Control**: Secure JWT authentication for `seeker` and `recruiter` roles.
- **Security & Stability**: 
  - Dynamic AI response sanitization (handles LLM Markdown hallucinations).
  - Lazy-loading for AI clients and rate-limit fallback handling.
  - Strict Express body limits and password stripping.

## Tech Stack
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database)
- **Google Gemini API** (`@google/genai`)
- **JWT & Bcrypt** (Auth & Security)
- **Multer & pdf-parse** (File Uploads & Extraction)

## Installation & Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Key Endpoints
- `POST /api/auth/register` & `POST /api/auth/login`
- `POST /api/resume/upload` (Requires PDF)
- `POST /api/jobs/ai-generate` (AI Job Chatbox)
- `GET /api/jobs/match` (Seeker ATS matching feed)
- `GET /api/applications/me` & `GET /api/applications/recruiter`