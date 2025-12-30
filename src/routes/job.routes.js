const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createJob,
  getJobs,
  getMatchedJobs,
} = require("../controllers/job.controller");

router.post("/", auth, createJob);
router.get("/", auth, getJobs);
router.get("/match", auth, getMatchedJobs);

module.exports = router;
