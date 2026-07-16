const Job = require("../models/Job");
const Application = require("../models/Application");
const {
  getAtsEligibility,
  validateJobPayload,
  normalizeJobPayload,
  mergeJobDraft,
  scoreJobMatch,
} = require("../utils/jobLogic");

/**
 * Recruiter creates a job
 */
exports.createJob = async (req, res) => {
  try {
    const { value: payload, errors } = validateJobPayload(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ msg: Object.values(errors)[0], errors });
    }

    const job = await Job.create({
      ...payload,
      recruiter: req.user._id,
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(422).json({ msg: err.message });
    }
    res.status(500).json({ msg: "Failed to create job" });
  }
};

/**
 * Get ALL jobs (filtered by recruiter if recruiter)
 */
exports.getJobs = async (req, res) => {
  try {
    const filter = req.user.role === "recruiter" ? { recruiter: req.user._id } : {};
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

    if (req.user.role !== "recruiter" || jobs.length === 0) {
      return res.json(jobs);
    }

    const summaries = await Application.aggregate([
      { $match: { recruiter: req.user._id } },
      {
        $group: {
          _id: "$job",
          applicationCount: { $sum: 1 },
          shortlistedCount: { $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] } },
          rejectedCount: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          latestApplicationAt: { $max: "$createdAt" },
        },
      },
    ]);
    const summaryByJob = new Map(summaries.map((summary) => [String(summary._id), summary]));

    res.json(jobs.map((job) => {
      const summary = summaryByJob.get(String(job._id));
      return {
        ...job,
        applicationCount: summary?.applicationCount || 0,
        shortlistedCount: summary?.shortlistedCount || 0,
        rejectedCount: summary?.rejectedCount || 0,
        latestApplicationAt: summary?.latestApplicationAt || null,
      };
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch jobs" });
  }
};

/**
 * Get jobs MATCHED to seeker skills
 */
exports.getMatchedJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    const matchedJobs = jobs
      .map(job => {
        const match = scoreJobMatch(job, req.user);
        const eligibility = getAtsEligibility(job, req.user);

        return {
          ...job,
          score: match.score,
          matchedSkills: match.matchedSkills,
          eligible: eligibility.eligible,
          eligibilityReasons: eligibility.reasons,
        };
      })
      .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);

    res.json(matchedJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to match jobs" });
  }
};

const mongoose = require("mongoose");
const ai = require("../services/ai.service");

/**
 * Get ATS score for a specific job (on-demand)
 */
exports.getJobAtsScore = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: "Invalid job ID format" });
    }
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (!req.user.resumeText) {
      return res.status(400).json({ msg: "Please upload your resume first." });
    }

    const atsResult = await ai.computeAtsScore(
      req.user.resumeText,
      job.description,
      job.skills,
      {
        skills: req.user.skills,
        college: req.user.college,
        collegeTier: req.user.collegeTier,
        cgpa: req.user.cgpa,
        degree: req.user.degree,
        achievements: req.user.achievements,
        experience: req.user.experience,
      },
      job.atsRequirements,
    );

    res.json(atsResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to compute ATS score" });
  }
};

/**
 * AI generates a job posting from a natural language prompt
 */
exports.generateJob = async (req, res) => {
  try {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (prompt.length < 3) {
      return res.status(400).json({ msg: "Describe the role with at least 3 characters." });
    }
    if (prompt.length > 4000) {
      return res.status(400).json({ msg: "Keep the assistant message under 4,000 characters." });
    }
    const draft = normalizeJobPayload(req.body?.draft);
    const result = await ai.generateJobFromPrompt(prompt, draft);
    if (!result) {
      return res.status(500).json({ msg: "AI generation failed" });
    }
    const job = mergeJobDraft(draft, result);
    const missingFields = [];
    if (!job.title) missingFields.push("title");
    if (!job.description) missingFields.push("description");

    res.json({
      job,
      missingFields,
      message: missingFields.length
        ? `I updated the draft. Add ${missingFields.join(" and ")} before publishing.`
        : "I updated the draft. Review the details, then publish when ready.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to generate job" });
  }
};
