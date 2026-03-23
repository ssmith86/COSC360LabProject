// created to separate the logic out from the server.js
// handleRegister.js provides functions to handle registration from users

const express = require("express");
const router = express.Router();
// use bcrypt to handle password hashing
const bcrypt = require("bcrypt");
// use getDB method from the db.js
const { getDB } = require("./db");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const db = getDB();
    const existingUser = await db.collection("users").findOne({ email });
    // if email already registered, return 409 and the following message
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Use the bcrypt to hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
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
