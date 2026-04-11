const User = require("../../models/User");
const Event = require("../../models/Event");
const SavedEvent = require("../../models/SavedEvent");
const Comment = require("../../models/Comment");
const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find all events owned by this user
    const ownedEvents = await Event.find({ ownerId: userId }).select("_id title");
    const ownedEventIds = ownedEvents.map((e) => e._id);

    if (ownedEventIds.length > 0) {
      // Find all other users who saved any of these events
      const affectedSaves = await SavedEvent.find({
        eventId: { $in: ownedEventIds },
        userId: { $ne: userId },
      }).select("userId eventId");

      // Build eventId -> title map for notification messages
      const eventTitleMap = {};
      ownedEvents.forEach((e) => {
        eventTitleMap[e._id.toString()] = e.title;
      });

      // Notify each affected user
      const notifications = affectedSaves.map((s) => ({
        userId: s.userId,
        type: "event_cancelled",
        category: "system",
        message: `An event you saved, "${eventTitleMap[s.eventId.toString()] || "an event"}", has been removed because the creator's account was deleted.`,
        relatedEventId: s.eventId,
        isRead: false,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      // Delete saves, comments, and events themselves
      await SavedEvent.deleteMany({ eventId: { $in: ownedEventIds } });
      await Comment.deleteMany({ eventId: { $in: ownedEventIds } });
      await Event.deleteMany({ ownerId: userId });
    }

    // Clean up the user's own data
    await SavedEvent.deleteMany({ userId });
    await Comment.deleteMany({ userId });
    await Notification.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
