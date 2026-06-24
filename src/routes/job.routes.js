const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createJob,
  getJobs,
  getMatchedJobs,
  getJobAtsScore,
  generateJob
} = require("../controllers/job.controller");

router.post("/", auth, createJob);
router.post("/ai-generate", auth, generateJob);
router.get("/", auth, getJobs);
router.get("/match", auth, getMatchedJobs);
router.get("/:jobId/ats-score", auth, getJobAtsScore);

module.exports = router;
