const Job = require("../models/Job");

/**
 * Recruiter creates a job
 */
exports.createJob = async (req, res) => {
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ msg: "Title and description are required" });
    }

    const job = await Job.create({
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      type: req.body.type,
      description: req.body.description,
      skills: req.body.skills || [],
      atsRequirements: req.body.atsRequirements || {
        minCgpa: 0, targetCollegeTier: "any", minExperienceYears: 0, requiredDegree: ""
      },
      recruiter: req.user._id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create job" });
  }
};

/**
 * Get ALL jobs (filtered by recruiter if recruiter)
 */
exports.getJobs = async (req, res) => {
  try {
    const filter = req.user.role === "recruiter" ? { recruiter: req.user._id } : {};
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch jobs" });
  }
};

/**
 * Get jobs MATCHED to seeker skills
 */
exports.getMatchedJobs = async (req, res) => {
  try {
    const userSkills = (req.user.skills || []).map(s => s.toLowerCase());

    if (userSkills.length === 0) {
      return res.json([]);
    }

    const jobs = await Job.find();

    const matchedJobs = jobs
      .map(job => {
        // STRICT FILTERS
        const reqs = job.atsRequirements || {};
        
        // 1. CGPA Check
        if (reqs.minCgpa > 0 && (req.user.cgpa || 0) < reqs.minCgpa) {
          return null;
        }

        // 2. Tier Check
        const tiers = { "tier1": 3, "tier2": 2, "tier3": 1, "unknown": 0 };
        if (reqs.targetCollegeTier && reqs.targetCollegeTier !== "any") {
          const requiredTierVal = tiers[reqs.targetCollegeTier] || 0;
          const userTierVal = tiers[req.user.collegeTier] || 0;
          if (userTierVal < requiredTierVal) {
            return null;
          }
        }

        // 3. Experience Check
        if (reqs.minExperienceYears > 0) {
          const expArray = Array.isArray(req.user.experience) ? req.user.experience : [];
          const estimatedYears = expArray.length * 1.5; 
          if (estimatedYears < reqs.minExperienceYears) {
             return null;
          }
        }

        // 4. Degree Check
        if (reqs.requiredDegree && reqs.requiredDegree.trim() !== "") {
          const userDegree = (req.user.degree || "").toLowerCase();
          const reqDegree = reqs.requiredDegree.toLowerCase();
          if (!userDegree.includes(reqDegree) && !reqDegree.includes(userDegree)) {
            return null; 
          }
        }

        const jobSkills = (job.skills || []).map(s => s.toLowerCase());

        if (jobSkills.length === 0) return null;

        const matched = jobSkills.filter(skill =>
          userSkills.includes(skill)
        );

        if (matched.length === 0) return null;

        const score = Math.round(
          (matched.length / jobSkills.length) * 100
        );

        return {
          ...job.toObject(),
          score,
          matchedSkills: matched,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

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
        college: req.user.college,
        collegeTier: req.user.collegeTier,
        cgpa: req.user.cgpa,
        achievements: req.user.achievements,
        experience: req.user.experience,
      }
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
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ msg: "Please provide a prompt" });
    }
    const result = await ai.generateJobFromPrompt(prompt);
    if (!result) {
      return res.status(500).json({ msg: "AI generation failed" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to generate job" });
  }
};
