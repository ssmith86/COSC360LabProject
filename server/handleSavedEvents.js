const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

// Created savedEvents collection (table) on cosc360db on MongoDB Atlas
// GET /api/savedevents?userId=123456 (hard coded for now)
// TODO: need to update this later
// get all saved events for a given user (joins with events collection)
router.get("/", async (req, res) => {
  const userId = parseInt(req.query.userId);

  if (!userId) {
    return res
      .status(400)
      .json({ message: "userId query parameter is required" });
  }

  try {
    const db = getDB();

    // find all saved events for this user
    const savedRecords = await db
      .collection("savedEvents")
      .find({
        userId: userId,
      })
      .toArray();

    // for each saved record, fetch the full event document
    const eventIds = savedRecords.map((record) => record.eventId);

    const { ObjectId } = require("mongodb");
    const savedEventDocs = await db
      .collection("events")
      .find({
        _id: { $in: eventIds.map((id) => new ObjectId(id)) },
      })
      .toArray();

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
    const db = getDB();

    // check if event is already saved to prevent issue
    const existing = await db.collection("savedEvents").findOne({
      userId: userId,
      eventId: eventId,
    });

    if (existing) {
      return res.status(409).json({ message: "Event already saved" });
    }

    await db.collection("savedEvents").insertOne({
      userId: userId,
      eventId: eventId,
      savedAt: new Date(),
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
    const db = getDB();

    await db.collection("savedEvents").deleteOne({
      userId: userId,
      eventId: eventId,
    });

    res.json({ message: "Event unsaved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
