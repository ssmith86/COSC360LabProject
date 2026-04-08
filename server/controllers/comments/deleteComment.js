const Comment = require("../../models/Comment");

module.exports = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (!comment.parentCommentId) {
      await Comment.deleteMany({
        $or: [{ _id: comment._id }, { parentCommentId: comment._id }],
      });
      res.json({ message: "Comment and replies deleted" });
    } else {
      await Comment.findByIdAndDelete(comment._id);
      res.json({ message: "Reply deleted" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
