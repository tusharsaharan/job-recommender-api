const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
        type: String,
        enum: ["applied", "shortlisted", "rejected"],
        default: "applied",
    },
    atsScore: { type: Number },
    atsBreakdown: {
      skillMatch: { type: Number },
      experienceRelevance: { type: Number },
      educationFit: { type: Number },
      projectsAndAchievements: { type: Number },
      keywordOptimization: { type: Number },
      overallPresentation: { type: Number }
    },
    atsTips: [{ type: String }]
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, seeker: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
