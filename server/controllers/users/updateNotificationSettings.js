const User = require("../../models/User");

const VALID_KEYS = [
  "commentOnMyEvent",
  "favouritedEventUpdated",
  "favouritedEventDeleted",
  "newEventInMyArea",
  "commentOnCommentedEvent",
  "attendingEventCancelled",
  "newEventInFollowedCategory",
];

const updateNotificationSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const prefs = {};
    for (const key of VALID_KEYS) {
      if (typeof req.body[key] === "boolean") {
        prefs[`notificationPreferences.${key}`] = req.body[key];
      }
    }

    await User.findByIdAndUpdate(id, { $set: prefs });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = updateNotificationSettings;
