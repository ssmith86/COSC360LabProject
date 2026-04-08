const SavedEvent = require("../../models/SavedEvent");

module.exports = async (req, res) => {
  const userId = req.query.userId;
  if (!userId || userId.trim() === "")
    return res
      .status(400)
      .json({ message: "userId query parameter is required" });
  try {
    const savedRecords = await SavedEvent.find({ userId }).populate("eventId");
    const savedEventDocs = savedRecords.map((r) => r.eventId).filter(Boolean);
    res.json(savedEventDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
