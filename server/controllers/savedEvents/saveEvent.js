const SavedEvent = require("../../models/SavedEvent");
const Event = require("../../models/Event");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  const { userId, eventId } = req.body;
  if (!userId || !eventId)
    return res.status(400).json({ message: "userId and eventId are required" });
  try {
    const existing = await SavedEvent.findOne({ userId, eventId });
    if (existing)
      return res.status(409).json({ message: "Event already saved" });

    await SavedEvent.create({ userId, eventId });

    const event = await Event.findById(eventId);
    if (event && event.ownerId && event.ownerId.toString() !== userId) {
      const saver = await User.findById(userId).select("userName");
      await Notification.create({
        userId: event.ownerId,
        type: "event_saved",
        category: "interaction",
        message: `${saver?.userName || "Someone"} saved your event "${event?.title || "An event"}".`,
        relatedEventId: eventId,
        isRead: false,
      });
    }
    res.status(201).json({ message: "Event saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
