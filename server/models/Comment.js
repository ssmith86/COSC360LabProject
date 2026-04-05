const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  replyToCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  isDeleted: { type: Boolean, default: false },
  likeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

commentSchema.index({ eventId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
