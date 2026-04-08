const SavedEvent = require("../../models/SavedEvent");

module.exports = async (req, res) => {
  const { userId, eventId } = req.body;
  if (!userId || !eventId)
    return res.status(400).json({ message: "userId and eventId are required" });
  try {
    await SavedEvent.deleteOne({ userId, eventId });
    res.json({ message: "Event unsaved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
