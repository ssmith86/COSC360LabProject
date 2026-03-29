const express = require("express");
const router = express.Router();
const { getDB } = require("./db");
const { ObjectId } = require("mongodb");

// Add a get method to fetch event by its id
router.get("/:eventId", async function (req, res) {
  const eventId = req.params.eventId;

  try {
    const db = getDB();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ message: "Event not found in database." });
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// handles update on events
router.put("/:eventId", async function (req, res) {
  const eventId = req.params.eventId;
  const updatedData = req.body;

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: "No update data provided." });
  }

  try {
    const db = getDB();
    const result = await db
      .collection("events")
      .updateOne({ _id: new ObjectId(eventId) }, { $set: updatedData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// handle delete on events
router.delete("/:eventId", async function (req, res) {
  const eventId = req.params.eventId;

  try {
    const db = getDB();
    const result = await db
      .collection("events")
      .deleteOne({ _id: new ObjectId(eventId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
