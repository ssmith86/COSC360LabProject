const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getDB } = require("./db");

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.status(200).json({
      message: `Welcome back, ${user.firstName}!`,
      isAdmin: user.isAdmin,
      // return user._id (mongodb object id) for front-end handling
      userId: user._id.toString(),
      // add return of user first name in response
      firstName: user.firstName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
