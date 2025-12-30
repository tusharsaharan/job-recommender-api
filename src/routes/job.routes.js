const express = require("express");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { createJob, getJobs } = require("../controllers/job.controller");

const router = express.Router();

router.get("/", auth, getJobs);
router.get("/match", auth, getJobs);
router.post("/", auth, role("recruiter"), createJob);

module.exports = router;
