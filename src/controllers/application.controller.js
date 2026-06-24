const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const ai = require("../services/ai.service");

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: "Invalid job ID format" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (job.recruiter.toString() === req.user._id.toString()) {
      return res.status(400).json({ msg: "Cannot apply to your own job" });
    }

    if (!req.user.resumeText) {
      return res.status(400).json({ msg: "Please upload your resume before applying." });
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

    const application = await Application.create({
      job: job._id,
      seeker: req.user._id,
      recruiter: job.recruiter,
      atsScore: atsResult.score,
      atsBreakdown: atsResult.breakdown,
      atsTips: atsResult.tips
    });

    res.json(application);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: "You have already applied to this job." });
    }
    console.error(error);
    res.status(500).json({ msg: "Failed to apply" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      seeker: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch applications" });
  }
};

exports.getApplicantsForRecruiter = async (req, res) => {
  try {
    const applications = await Application.find({
      recruiter: req.user._id,
    })
      .populate("job")
      .populate("seeker", "name email skills cgpa college collegeTier achievements")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch applicants" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ msg: "Invalid application ID format" });
    }

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to update status" });
  }
};