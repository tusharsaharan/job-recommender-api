<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">
  <a href="https://github.com/tusharsaharan/job-recommender-api/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/tusharsaharan/job-recommender-api.svg?style=for-the-badge&color=brightgreen" alt="Contributors" />
  </a>
  <a href="https://github.com/tusharsaharan/job-recommender-api/network/members">
    <img src="https://img.shields.io/github/forks/tusharsaharan/job-recommender-api.svg?style=for-the-badge" alt="Forks" />
  </a>
  <a href="https://github.com/tusharsaharan/job-recommender-api/stargazers">
    <img src="https://img.shields.io/github/stars/tusharsaharan/job-recommender-api.svg?style=for-the-badge" alt="Stargazers" />
  </a>
  <a href="https://github.com/tusharsaharan/job-recommender-api/issues">
    <img src="https://img.shields.io/github/issues/tusharsaharan/job-recommender-api.svg?style=for-the-badge" alt="Issues" />
  </a>
  <a href="https://github.com/tusharsaharan/job-recommender-api/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/tusharsaharan/job-recommender-api.svg?style=for-the-badge" alt="License" />
  </a>
</div>

<br />
<div align="center">
  <h2 align="center">JobMatch API</h2>

  <p align="center">
    A Next-Generation Recruitment Backend Platform Powered by Google Gemini AI
    <br />
    <a href="https://github.com/tusharsaharan/job-recommender-api"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/tusharsaharan/job-recommender-api">View Live Demo</a>
    ·
    <a href="https://github.com/tusharsaharan/job-recommender-api/issues">Report Bug</a>
    ·
    <a href="https://github.com/tusharsaharan/job-recommender-api/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#key-features">Key Features</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation--setup">Installation & Setup</a></li>
      </ul>
    </li>
    <li><a href="#key-endpoints">Key Endpoints</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#author">Author</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

JobMatch API is a Node.js/Express backend for JobMatch, a next-generation recruitment platform powered by Google Gemini.

Instead of relying on traditional keyword matching, this system leverages advanced LLM capabilities to parse PDF resumes, extract key skills and achievements, auto-generate structured job requirements for recruiters, and calculate real-time ATS match scores with actionable feedback.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
* [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
* [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
* [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
* [![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
* [![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KEY FEATURES -->
## Key Features

* **AI Resume Parsing**: Upload a PDF resume and automatically extract structured skills, education, and achievements using Google Gemini Flash Lite.
* **AI Job Generation**: Recruiters can describe a job role in plain English, and the AI auto-fills the form with ATS requirements.
* **ATS Match Scoring**: Analyzes a job seeker's resume against a target job description, computing a compatibility score and actionable improvement feedback.
* **Role-Based Access Control**: Secure JWT authentication supporting `seeker` and `recruiter` roles.
* **Security & Stability**:
  * Dynamic AI response sanitization (handles LLM Markdown hallucinations).
  * Lazy-loading for AI clients and rate-limit fallback handling.
  * Strict Express body limits and password stripping.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* **Node.js**: v18.x or higher
* **npm**: v9.x or higher
* **MongoDB**: A running MongoDB instance (local or MongoDB Atlas)
* **Google Gemini API Key**: Obtainable from Google AI Studio

### Installation & Setup

1. **Clone the repository**:
   ```sh
   git clone https://github.com/tusharsaharan/job-recommender-api.git
   cd job-recommender-api
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Start the development server**:
   ```sh
   npm run dev
   ```

5. **Run Tests**:
   ```sh
   npm test
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KEY ENDPOINTS -->
## Key Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`seeker` or `recruiter`) | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT | No |
| `POST` | `/api/resume/upload` | Upload PDF resume for AI parsing | Yes (`seeker`) |
| `POST` | `/api/jobs/ai-generate` | Generate job posting details via AI | Yes (`recruiter`) |
| `GET` | `/api/jobs/match` | Get seeker ATS match score feed | Yes (`seeker`) |
| `GET` | `/api/applications/me` | List job seeker's applications | Yes (`seeker`) |
| `GET` | `/api/applications/recruiter` | List applicant submissions for recruiter | Yes (`recruiter`) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHOR -->
## Author

**Tushar Saharan**
* GitHub: [@tusharsaharan](https://github.com/tusharsaharan)
* Project Link: [https://github.com/tusharsaharan/job-recommender-api](https://github.com/tusharsaharan/job-recommender-api)

<p align="right">(<a href="#readme-top">back to top</a>)</p>