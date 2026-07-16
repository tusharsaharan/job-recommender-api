const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");
const applicationRoutes = require("./routes/application.routes");
const messageRoutes = require("./routes/message.routes");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cors({
  origin: "*",
  methods: "*",
  allowedHeaders: "*"
}));

app.get("/", (req, res) => {
  res.send("Job Recommender API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);

// Global error handler — catches multer errors, unhandled throws, etc.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  if (err.name === "MulterError") {
    return res.status(400).json({ msg: `Upload error: ${err.message}` });
  }
  if (err.message === "Only PDF allowed") {
    return res.status(400).json({ msg: "Only PDF files are accepted" });
  }
  res.status(500).json({ msg: err.message || "Internal server error" });
});

module.exports = app;
