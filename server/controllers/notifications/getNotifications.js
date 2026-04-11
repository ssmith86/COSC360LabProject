const Notification = require("../../models/Notification");
const User = require("../../models/User");

module.exports = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId is required" });
  try {
    const user = await User.findById(userId).select("_id");
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
