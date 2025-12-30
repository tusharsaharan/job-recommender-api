const Job = require("../models/Job");

exports.createJob = async (req, res) => {
  const job = await Job.create({
    ...req.body,
    recruiter: req.user._id,
    skills: req.body.skills || req.body.requiredSkills || [],
  });
  res.json(job);
};

exports.getJobs = async (req, res) => {
  const jobs = await Job.find().lean();

  if (!req.user || !req.user.skills || req.user.skills.length === 0) {
    return res.json(jobs.map(j => ({ ...j, score: 0 })));
  }

  const userSkills = req.user.skills.map(s => s.toLowerCase());

  const scoredJobs = jobs.map(job => {
    const jobSkills =
      job.skills ||
      job.requiredSkills ||
      [];

    if (jobSkills.length === 0) {
      return { ...job, score: 0 };
    }

    let matched = 0;
    for (const skill of jobSkills) {
      if (userSkills.includes(skill.toLowerCase())) {
        matched++;
      }
    }

    const score = matched / jobSkills.length;
    return { ...job, score };
  });

  scoredJobs.sort((a, b) => b.score - a.score);
  res.json(scoredJobs);
};
