const fs = require("fs");
const pdfParse = require("pdf-parse");
const User = require("../models/User");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const SKILLS = [
  "javascript", "typescript", "react", "node",
  "express", "mongodb", "sql", "python",
  "java", "c++", "html", "css", "tailwind",
  "docker", "aws", "git"
];

exports.uploadResume = [
  upload.single("resume"),
  async (req, res) => {
    const buffer = fs.readFileSync(req.file.path);

    const data = await pdfParse(buffer);
    const text = data.text.toLowerCase();

    const extracted = SKILLS.filter(skill =>
      text.includes(skill)
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills: extracted },
      { new: true }
    );

    fs.unlinkSync(req.file.path);

    res.json({
      skills: extracted,
      user
    });
  }
];
