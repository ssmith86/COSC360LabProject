const Comment = require("../../models/Comment");
const Event = require("../../models/Event");

module.exports = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await Comment.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 });

    const eventIds = [...new Set(comments.map((c) => c.eventId?.toString()).filter(Boolean))];
    const events = await Event.find({ _id: { $in: eventIds } }).select("title");
    const eventMap = {};
    events.forEach((e) => {
      eventMap[e._id.toString()] = e.title;
    });

    const result = comments.map((c) => ({
      _id: c._id,
      content: c.content,
      createdAt: c.createdAt,
      eventId: c.eventId,
      eventTitle: eventMap[c.eventId?.toString()] || "Unknown Event",
      isReply: !!c.parentCommentId,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
