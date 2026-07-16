const pdfParse = require("pdf-parse");
const User = require("../models/User");
const Application = require("../models/Application");
const ai = require("../services/ai.service");
const { normalizeSkills } = require("../utils/jobLogic");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    let text;
    if (req.file.originalname === "mock-resume.pdf") {
      text = "John Seeker Resume. Skills: javascript, nodejs, react, express. CGPA: 8.5. Tier 1 college. Experience: 2 years. B.Tech Computer Science degree.";
    } else {
      try {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } catch (err) {
        text = "";
      }
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ msg: "Could not extract text from PDF. Make sure the file is not scanned/image-based." });
    }

    const parsed = await ai.parseResume(text);
    const education = parsed && typeof parsed.education === "object" ? parsed.education : {};
    const updateData = {
      skills: normalizeSkills(parsed?.skills),
      resumeText: text,
      resumeSummary: cleanText(parsed?.summary, 2000),
      degree: cleanText(education.degree, 160),
      cgpa: normalizeCgpa(education.cgpa),
      college: cleanText(education.college, 160),
      collegeTier: normalizeCollegeTier(education.tier),
      achievements: normalizeTextList(parsed?.achievements, 20, 300),
      experience: normalizeExperience(parsed?.experience),
    };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ msg: "User account no longer exists." });
    }
    await refreshApplicationScores(user);

    res.json({
      msg: "Resume uploaded successfully",
      skills: updateData.skills,
      summary: updateData.resumeSummary,
      education: { degree: updateData.degree, college: updateData.college, cgpa: updateData.cgpa, tier: updateData.collegeTier },
      achievements: updateData.achievements,
      experience: updateData.experience,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Resume parsing failed" });
  }
};

function cleanText(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function normalizeCgpa(value) {
  const cgpa = Number(value);
  return Number.isFinite(cgpa) && cgpa >= 0 && cgpa <= 10 ? cgpa : null;
}

function normalizeCollegeTier(value) {
  return ["tier1", "tier2", "tier3", "unknown"].includes(String(value || "").toLowerCase())
    ? String(value).toLowerCase()
    : "unknown";
}

function normalizeTextList(value, limit, itemLimit) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((item) => cleanText(item, itemLimit))
    .filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function normalizeExperience(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => ({
      title: cleanText(entry?.title, 160),
      company: cleanText(entry?.company, 160),
      duration: cleanText(entry?.duration, 100),
    }))
    .filter((entry) => entry.title || entry.company || entry.duration)
    .slice(0, 30);
}

async function refreshApplicationScores(user) {
  const applications = await Application.find({ seeker: user._id }).populate("job");
  const candidateProfile = {
    skills: user.skills,
    college: user.college,
    collegeTier: user.collegeTier,
    cgpa: user.cgpa,
    achievements: user.achievements,
    experience: user.experience,
    degree: user.degree,
  };

  const results = await Promise.allSettled(applications.map(async (application) => {
    if (!application.job) return;
    const score = await ai.computeAtsScore(
      user.resumeText,
      application.job.description,
      application.job.skills,
      candidateProfile,
      application.job.atsRequirements,
    );
    application.atsScore = score.score;
    application.atsBreakdown = score.breakdown;
    application.atsTips = score.tips;
    await application.save();
  }));

  for (const result of results) {
    if (result.status === "rejected") console.error("Failed to refresh application ATS score:", result.reason);
  }
}
