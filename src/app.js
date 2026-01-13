const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");

const app = express();

app.use(cors({
  origin: "*",
  methods: "*",
  allowedHeaders: "*"
}));

app.get("/", (req, res) => {
  res.send("Job Recommender API running");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/jobs", jobRoutes);
app.use("/resume", resumeRoutes);

module.exports = app;
