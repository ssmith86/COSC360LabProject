const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  bannedCount: { type: Number, default: 0 },
  lastBannedAt: { type: Date, default: null },
  lastUnbannedAt: { type: Date, default: null },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);