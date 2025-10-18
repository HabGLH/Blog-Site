import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register user
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify token and return current user info (protected route)
export const verifyUser = async (req, res) => {
  // protect middleware attaches req.user
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
};

// Update profile (username, email)
export const updateProfile = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  const { username, email } = req.body;

  try {
    // check if email is being changed to an email that already exists
    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ message: "Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        username: username || req.user.username,
        email: email || req.user.email,
      },
      { new: true, runValidators: true }
    ).select("-password");

    // Optionally refresh token (keep same behavior as login/register)
    const token = jwt.sign({ id: updated._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
