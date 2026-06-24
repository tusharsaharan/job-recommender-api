const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please provide name, email, and password" });
    }

    if (role && !["seeker", "recruiter"].includes(role)) {
      return res.status(400).json({ msg: "Role must be 'seeker' or 'recruiter'" });
    }

    const emailLower = email.toLowerCase();
    const exists = await User.findOne({ email: emailLower });
    if (exists) return res.status(400).json({ msg: "User exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: emailLower,
      password: hashed,
      role: role || "seeker",
    });

    res.json({ msg: "Registered" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ msg: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Login failed" });
  }
};

exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ msg: "skills must be an array" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error("Update skills error:", err.message);
    res.status(500).json({ msg: "Failed to update skills" });
  }
};
