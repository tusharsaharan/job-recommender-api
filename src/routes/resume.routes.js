const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadResume } = require("../controllers/resume.controller");

router.post(
  "/upload",
  auth,
  role("seeker"),
  upload.single("resume"),
  uploadResume
);

module.exports = router;
