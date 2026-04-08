// created to separate the logic out from the server.js
// handleRegister.js provides functions to handle registration from users

const express = require("express");
const router = express.Router();
// use bcrypt to handle password hashing
const bcrypt = require("bcrypt");
// use User model from mongoose
const User = require("../models/User");
// add multer to handleRegister
const multer = require("multer");
const path = require("path");

// add the multer steup for user registration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Only image files are allowed"), false);
};

const upload = multer({ storage, fileFilter });

router.post("/", upload.single("avatar"), async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // if email already registered, return 409 and the following message
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // if username already registered, return 409, and message
    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Use the bcrypt to hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      avatar: req.file ? `/uploads/${req.file.filename}` : "", // add user profile img
    });

    // use 201 for created (200 is for ok)
    res.status(201).json({
      message: `Welcome, ${firstName}! Your account has been created.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
