const pdfParse = require("pdf-parse");
const User = require("../models/User");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text.toLowerCase();

    const skillsList = [
      "javascript",
      "react",
      "node",
      "express",
      "mongodb",
      "sql",
      "python",
      "java",
      "c++",
      "html",
      "css",
      "git",
    ];

    const skills = skillsList.filter(skill =>
      text.includes(skill)
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills },
      { new: true }
    );

    res.json({
      msg: "Resume uploaded successfully",
      skills,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Resume parsing failed" });
  }
};
