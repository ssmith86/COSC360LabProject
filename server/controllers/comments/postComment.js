const Comment = require("../../models/Comment");
const Event = require("../../models/Event");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  try {
    const { eventId, userId, content, parentCommentId, replyToCommentId } =
      req.body;
    if (!eventId || !userId || !content?.trim())
      return res
        .status(400)
        .json({ error: "eventId, userId, and content are required" });

    const comment = await Comment.create({
      eventId,
      userId,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
      replyToCommentId: replyToCommentId || null,
    });
    const populated = await comment.populate(
      "userId",
      "userName firstName lastName avatar",
    );

    if (!parentCommentId) {
      const event = await Event.findById(eventId);
      if (event && event.ownerId && event.ownerId.toString() !== userId) {
        const owner = await User.findById(event.ownerId).select("userName notificationPreferences");
        const wantsNotif = owner?.notificationPreferences?.commentOnMyEvent !== false;
        if (wantsNotif) {
          const commenter = await User.findById(userId).select("userName");
          await Notification.create({
            userId: event.ownerId,
            type: "new_comment",
            category: "interaction",
            message: `${commenter?.userName || "Someone"} commented on your event "${event?.title || "An event"}".`,
            relatedEventId: eventId,
            relatedCommentId: comment._id,
            isRead: false,
          });
        }
      }
    }

    if (replyToCommentId) {
      const repliedComment = await Comment.findById(replyToCommentId);
      if (repliedComment && repliedComment.userId.toString() !== userId) {
        const recipient = await User.findById(repliedComment.userId).select("notificationPreferences");
        const wantsNotif = recipient?.notificationPreferences?.commentOnCommentedEvent !== false;
        if (wantsNotif) {
          const replier = await User.findById(userId).select("userName");
          await Notification.create({
            userId: repliedComment.userId,
            type: "comment_reply",
            category: "interaction",
            message: `${replier?.userName || "Someone"} replied to your comment.`,
            relatedEventId: eventId,
            relatedCommentId: comment._id,
            isRead: false,
          });
        }
      }
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
