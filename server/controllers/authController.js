const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.register = async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ message: "All fields are required." });
  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered." });
    if (await User.findOne({ userName }))
      return res.status(409).json({ message: "Username already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      avatar: req.file ? `/uploads/${req.file.filename}` : "",
    });
    res
      .status(201)
      .json({
        message: `Welcome, ${firstName}! Your account has been created.`,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid email or password." });
    user.lastLogin = new Date();
    await user.save();
    res.status(200).json({
      message: `Welcome back, ${user.firstName}!`,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned || false,
      userId: user._id.toString(),
      firstName: user.firstName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
