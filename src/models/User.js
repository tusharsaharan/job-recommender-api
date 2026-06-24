const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["seeker", "recruiter"],
    default: "seeker",
  },
  skills: [{ type: String }],
  resumeText: { type: String },
  resumeSummary: { type: String },
  cgpa: { type: Number },
  college: { type: String },
  collegeTier: { type: String, enum: ["tier1", "tier2", "tier3", "unknown"], default: "unknown" },
  achievements: [{ type: String }],
  experience: [{ title: String, company: String, duration: String }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
