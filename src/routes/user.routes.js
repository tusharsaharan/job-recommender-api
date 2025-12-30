const express = require("express");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { updateSkills } = require("../controllers/auth.controller");
const { uploadResume } = require("../controllers/resume.controller");

const router = express.Router();

router.get("/me", auth, (req, res) => res.json(req.user));
router.patch("/skills", auth, updateSkills);
router.post("/resume", auth, role("seeker"), uploadResume);

module.exports = router;
