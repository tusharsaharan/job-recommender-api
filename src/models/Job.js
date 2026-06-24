const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  skills: [String],
  location: String,
  type: String,
  atsRequirements: {
    minCgpa: { type: Number, default: 0 },
    targetCollegeTier: { type: String, enum: ["tier1", "tier2", "tier3", "any"], default: "any" },
    minExperienceYears: { type: Number, default: 0 },
    requiredDegree: { type: String, default: "" }
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
