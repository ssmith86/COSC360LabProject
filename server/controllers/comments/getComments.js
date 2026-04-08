const Comment = require("../../models/Comment");

module.exports = async (req, res) => {
  try {
    const comments = await Comment.find({ eventId: req.params.eventId })
      .populate("userId", "userName firstName lastName avatar")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
