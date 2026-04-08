const Event = require("../../models/Event");
const SavedEvent = require("../../models/SavedEvent");
const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  const newStatus = req.body.status || "published";
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const oldStatus = event.status;
    event.status = newStatus;
    await event.save();

    const statusNotifyMap = {
      paused: "event_paused",
      published: "event_restored",
      cancelled: "event_cancelled",
    };
    if (newStatus !== oldStatus && statusNotifyMap[newStatus]) {
      const savedRecords = await SavedEvent.find({
        eventId: event._id,
        userId: { $ne: event.ownerId },
      });
      if (savedRecords.length > 0) {
        await Notification.insertMany(
          savedRecords.map((record) => ({
            userId: record.userId,
            type: statusNotifyMap[newStatus],
            category: "system",
            message: `The event "${event?.title || "An event"}" has been ${newStatus === "published" ? "restored" : newStatus}.`,
            relatedEventId: event._id,
            isRead: false,
          })),
        );
      }
    }
    res.status(200).json({ message: "Event status updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
