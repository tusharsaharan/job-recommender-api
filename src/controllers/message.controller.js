const mongoose = require("mongoose");
const Application = require("../models/Application");
const Message = require("../models/Message");

exports.getApplicationMessages = async (req, res) => {
  try {
    const application = await findParticipantApplication(req.params.applicationId, req.user._id);
    if (!application) return res.status(403).json({ msg: "You do not have access to this conversation." });

    await Message.updateMany(
      { application: application._id, recipient: req.user._id, readAt: null },
      { $set: { readAt: new Date() } },
    );
    const messages = await Message.find({ application: application._id })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to load messages." });
  }
};

exports.sendApplicationMessage = async (req, res) => {
  try {
    const application = await findParticipantApplication(req.params.applicationId, req.user._id);
    if (!application) return res.status(403).json({ msg: "You do not have access to this conversation." });

    const text = cleanMessageText(req.body?.text);
    if (!text) return res.status(422).json({ msg: "Message cannot be empty." });
    if (text.length > 2000) return res.status(422).json({ msg: "Messages cannot exceed 2,000 characters." });

    const recipient = application.recruiter.toString() === req.user._id.toString()
      ? application.seeker
      : application.recruiter;
    const message = await Message.create({
      application: application._id,
      sender: req.user._id,
      recipient,
      text,
    });
    await message.populate("sender", "name role");
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to send message." });
  }
};

async function findParticipantApplication(applicationId, userId) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) return null;
  const application = await Application.findById(applicationId).select("recruiter seeker");
  if (!application) return null;
  const user = userId.toString();
  return application.recruiter.toString() === user || application.seeker.toString() === user
    ? application
    : null;
}

function cleanMessageText(value) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";
}
