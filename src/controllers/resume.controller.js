const pdfParse = require("pdf-parse");
const User = require("../models/User");
const ai = require("../services/ai.service");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    const parsed = await ai.parseResume(text);

    const updateData = {
      skills: parsed.skills || [],
      resumeText: text,
      resumeSummary: parsed.summary || "",
    };

    if (parsed.education) {
      if (parsed.education.cgpa) updateData.cgpa = parsed.education.cgpa;
      if (parsed.education.college) updateData.college = parsed.education.college;
      if (parsed.education.tier) updateData.collegeTier = parsed.education.tier;
    }

    if (parsed.achievements && parsed.achievements.length > 0) {
      updateData.achievements = parsed.achievements;
    }

    if (parsed.experience && parsed.experience.length > 0) {
      updateData.experience = parsed.experience;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.json({
      msg: "Resume uploaded successfully",
      skills: updateData.skills,
      summary: updateData.resumeSummary,
      education: parsed.education,
      achievements: parsed.achievements,
      experience: parsed.experience,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Resume parsing failed" });
  }
};
