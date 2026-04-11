const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  const { userId, category } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });
  const filter = { userId };
  if (category === "system" || category === "interaction") {
    filter.category = category;
  }
  try {
    await Notification.deleteMany(filter);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
