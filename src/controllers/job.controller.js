const Job = require("../models/Job");

/**
 * Recruiter creates a job
 */
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      title: req.body.title,
      company: req.body.company,
      description: req.body.description,
      skills: req.body.skills || [],
      recruiter: req.user._id,
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create job" });
  }
};

/**
 * Get ALL jobs (no matching, mainly for recruiter/admin)
 */
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
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
