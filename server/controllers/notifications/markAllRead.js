const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });
  try {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
