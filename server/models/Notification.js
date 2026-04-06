const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "new_comment", "comment_reply", "event_saved",
      "event_paused", "event_restored", "event_cancelled", 
      "account_banned", "account_unbanned",
    ],
    required: true,
  },
  category: {
    type: String,
    enum: ["system", "interaction"],
    required: true,
  },
  message: { type: String, required: true },
  relatedEventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  relatedCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
