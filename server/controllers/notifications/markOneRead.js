const mongoose = require("mongoose");
const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid notification id" });
  try {
    await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
