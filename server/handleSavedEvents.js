const express = require("express");
const router = express.Router();
const SavedEvent = require("./models/SavedEvent");

// GET /api/savedevents?userId=xxx (this has been updated instead of hard coded)
// get all saved events for a given user (using populate to join with events)
router.get("/", async (req, res) => {
  const userId = req.query.userId;

  if (!userId || userId.trim() === "") {
    return res
      .status(400)
      .json({ message: "userId query parameter is required" });
  }

  try {
    // find all saved events for this user and populate the event data
    const savedRecords = await SavedEvent.find({ userId: userId })
      .populate("eventId");

    // for each saved record, fetch the full event document from populated records
    const savedEventDocs = savedRecords
      .map((record) => record.eventId)
      .filter(Boolean);

    res.json(savedEventDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/savedevents
// save an event for a user when user clicks save button on event card
// Body: { userId, eventId }
router.post("/", async (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: "userId and eventId are required" });
  }

  try {
    // check if event is already saved to prevent issue
    const existing = await SavedEvent.findOne({
      userId: userId,
      eventId: eventId,
    });

    if (existing) {
      return res.status(409).json({ message: "Event already saved" });
    }

    await SavedEvent.create({
      userId: userId,
      eventId: eventId,
    });

    res.status(201).json({ message: "Event saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/savedevents
// to unsave an event for a user when clicking the save button
// Body: { userId, eventId }
router.delete("/", async (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: "userId and eventId are required" });
  }

  try {
    await SavedEvent.deleteOne({
      userId: userId,
      eventId: eventId,
    });

    res.json({ message: "Event unsaved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
