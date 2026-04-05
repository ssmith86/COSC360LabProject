const express = require("express");
const router = express.Router();
const Comment = require("./models/Comment");

// GET /api/comments/:eventId
// returns all comments for an event, with user info populated
// include top-level root comments and nested replies
router.get("/:eventId", async (req, res) => {
  try {
    const comments = await Comment.find({ eventId: req.params.eventId })
      .populate("userId", "userName firstName lastName")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
