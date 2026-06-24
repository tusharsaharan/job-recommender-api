const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");
const applicationRoutes = require("./routes/application.routes");

const app = express();

app.use(express.json());
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

module.exports = app;
