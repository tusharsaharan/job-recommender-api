const Application = require("../models/Application");
const Job = require("../models/Job");

exports.applyToJob = async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ msg: "Job not found" });
  }

  if (job.recruiter.toString() === req.user._id.toString()) {
    return res.status(400).json({ msg: "Cannot apply to your own job" });
  }

  const application = await Application.create({
    job: job._id,
    seeker: req.user._id,
    recruiter: job.recruiter,
  });

  res.json(application);
};

exports.getMyApplications = async (req, res) => {
  const applications = await Application.find({
    seeker: req.user._id,
  })
    .populate("job")
    .sort({ createdAt: -1 });

  res.json(applications);
};

exports.getApplicantsForRecruiter = async (req, res) => {
  const applications = await Application.find({
    recruiter: req.user._id,
  })
    .populate("job")
    .populate("seeker", "name email skills")
    .sort({ createdAt: -1 });

  res.json(applications);
};
