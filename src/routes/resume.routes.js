const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadResume } = require("../controllers/resume.controller");

router.post(
  "/upload",
  auth,
  upload.single("resume"),
  uploadResume
);

module.exports = router;
