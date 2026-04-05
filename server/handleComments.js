const express = require("express");
const router = express.Router();
const Comment = require("./models/Comment");

// GET /api/comments/:eventId
// returns all comments for an event, with user info populated
// include top-level root comments and nested replies
router.get("/:eventId", async (req, res) => {
  try {
    const comments = await Comment.find({ eventId: req.params.eventId })
      .populate("userId", "userName firstName lastName avatar")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments
// new comment or reply
router.post("/", async (req, res) => {
  try {
    const { eventId, userId, content, parentCommentId, replyToCommentId } = req.body;

    if (!eventId || !userId || !content?.trim()) {
      return res.status(400).json({ error: "eventId, userId, and content are required" });
    }

    const comment = await Comment.create({
      eventId,
      userId,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
      replyToCommentId: replyToCommentId || null,
    });

    const populated = await comment.populate("userId", "userName firstName lastName avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:commentId
router.delete("/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (!comment.parentCommentId) {
      // root comment: hard delete with everything under it
      await Comment.deleteMany({
        $or: [
          { _id: comment._id },
          { parentCommentId: comment._id },
        ],
      });
      res.json({ message: "Comment and replies deleted" });
    } else {
      await Comment.findByIdAndDelete(comment._id);
      res.json({ message: "Reply deleted" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
