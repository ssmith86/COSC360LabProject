const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

// GET /api/analytics/event-trends
// Returns event count grouped by month (last 12 months)
router.get("/event-trends", async (req, res) => {
  try {
    const db = getDB();
    const events = await db.collection("events").find({}).toArray();

    const counts = {};
    events.forEach((e) => {
      const date = e.event && e.event.start_date;
      if (!date) return;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/popular-events
// Returns top 10 events ranked by number of saves
router.get("/popular-events", async (req, res) => {
  try {
    const db = getDB();
    const pipeline = [
      { $group: { _id: "$eventId", saveCount: { $sum: 1 } } },
      { $sort: { saveCount: -1 } },
      { $limit: 10 },
    ];
    const topSaved = await db.collection("savedEvents").aggregate(pipeline).toArray();

    const { ObjectId } = require("mongodb");
    const eventIds = topSaved
      .map((s) => {
        try { return new ObjectId(s._id); } catch { return null; }
      })
      .filter(Boolean);

    const events = await db
      .collection("events")
      .find({ _id: { $in: eventIds } })
      .toArray();

    const eventMap = {};
    events.forEach((e) => { eventMap[e._id.toString()] = e; });

    const result = topSaved
      .filter((s) => eventMap[s._id])
      .map((s) => ({
        eventId: s._id,
        eventName: eventMap[s._id].event?.name || "Unknown",
        saveCount: s.saveCount,
      }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/location-distribution
// Returns event count grouped by city
router.get("/location-distribution", async (req, res) => {
  try {
    const db = getDB();
    const events = await db.collection("events").find({}).toArray();

    const counts = {};
    events.forEach((e) => {
      const city = e.event?.location?.city || "Unknown";
      counts[city] = (counts[city] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/user-growth (admin only data)
// Returns new user registrations grouped by month
router.get("/user-growth", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find({}).toArray();

    const counts = {};
    users.forEach((u) => {
      const date = u.createdAt;
      if (!date) return;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
