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
  notificationPreferences: {
    commentOnMyEvent: { type: Boolean, default: true },
    favouritedEventUpdated: { type: Boolean, default: true },
    favouritedEventDeleted: { type: Boolean, default: true },
    newEventInMyArea: { type: Boolean, default: true },
    commentOnCommentedEvent: { type: Boolean, default: true },
    attendingEventCancelled: { type: Boolean, default: true },
    newEventInFollowedCategory: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model("User", userSchema);