const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

// Helper: parse from/to query params into Date objects
function parseDateRange(query) {
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;
  if (to) to.setHours(23, 59, 59, 999);
  return { from, to };
}

// Helper: determine grouping granularity based on date range
// <= 30 days → "day", > 30 days → "month"
function getGranularity(from, to) {
  if (!from || !to) return "month";
  const diffMs = to.getTime() - from.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 30 ? "day" : "month";
}

function dateToKey(d, granularity) {
  if (granularity === "day") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// GET /api/analytics/event-trends
// Returns event count grouped by day or month, filtered by date range
router.get("/event-trends", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);
    const events = await db.collection("events").find({}).toArray();

    const counts = {};
    events.forEach((e) => {
      const date = e.event && e.event.start_date;
      if (!date) return;
      const d = new Date(date);
      if (from && d < from) return;
      if (to && d > to) return;
      const key = dateToKey(d, granularity);
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));

    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/popular-events
// Returns top 10 events ranked by saves, filtered by save date
router.get("/popular-events", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);

    const matchStage = {};
    if (from || to) {
      matchStage.savedAt = {};
      if (from) matchStage.savedAt.$gte = from.toISOString();
      if (to) matchStage.savedAt.$lte = to.toISOString();
    }

    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
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
// Returns event count grouped by city, filtered by date range
router.get("/location-distribution", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);
    const events = await db.collection("events").find({}).toArray();

    const counts = {};
    events.forEach((e) => {
      const date = e.event?.start_date;
      if (from || to) {
        if (!date) return;
        const d = new Date(date);
        if (from && d < from) return;
        if (to && d > to) return;
      }
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

// GET /api/analytics/user-growth (admin)
// Returns new user registrations grouped by day or month, filtered by date range
router.get("/user-growth", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);
    const users = await db.collection("users").find({}).toArray();

    const counts = {};
    users.forEach((u) => {
      const date = u.createdAt;
      if (!date) return;
      const d = new Date(date);
      if (from && d < from) return;
      if (to && d > to) return;
      const key = dateToKey(d, granularity);
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));

    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/event-summary
// Returns total events, total saves, and new events in the given period
router.get("/event-summary", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);

    const totalEvents = await db.collection("events").countDocuments();
    const totalSaves = await db.collection("savedEvents").countDocuments();

    const events = await db.collection("events").find({}).toArray();
    const newInPeriod = events.filter((e) => {
      const d = e.event?.start_date;
      if (!d) return false;
      const date = new Date(d);
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    }).length;

    const saves = await db.collection("savedEvents").find({}).toArray();
    const savesInPeriod = saves.filter((s) => {
      const d = s.savedAt;
      if (!d) return false;
      const date = new Date(d);
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    }).length;

    const hasComments = (await db.listCollections({ name: "comments" }).toArray()).length > 0;
    let commentsInPeriod = null;
    if (hasComments) {
      const comments = await db.collection("comments").find({}).toArray();
      commentsInPeriod = comments.filter((c) => {
        const d = c.createdAt;
        if (!d) return false;
        const date = new Date(d);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      }).length;
    }

    res.json({ totalEvents, totalSaves, newInPeriod, savesInPeriod, commentsInPeriod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/save-trends
// Returns save count grouped by day or month, filtered by date range
router.get("/save-trends", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);
    const saves = await db.collection("savedEvents").find({}).toArray();

    const counts = {};
    saves.forEach((s) => {
      const date = s.savedAt;
      if (!date) return;
      const d = new Date(date);
      if (from && d < from) return;
      if (to && d > to) return;
      const key = dateToKey(d, granularity);
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));

    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/top-creators
// Returns top 10 users by events created, filtered by date range
router.get("/top-creators", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);

    const events = await db.collection("events").find({}).toArray();

    const filtered = events.filter((e) => {
      const date = e.event?.start_date;
      if (!date) return !from && !to;
      const d = new Date(date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    const counts = {};
    filtered.forEach((e) => {
      const creator = e.owner?.name || "Unknown";
      counts[creator] = (counts[creator] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([creator, eventCount]) => ({ creator, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/user-summary (admin)
// Returns total users, active users, banned users (fixed totals)
router.get("/user-summary", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find({}).toArray();
    const totalUsers = users.length;
    const bannedUsers = users.filter((u) => u.isBanned).length;
    const activeUsers = totalUsers - bannedUsers;

    res.json({ totalUsers, activeUsers, bannedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/user-activity-breakdown (admin)
// Returns active (logged in within range), inactive (last login outside range), banned users
router.get("/user-activity-breakdown", async (req, res) => {
  try {
    const db = getDB();
    const { from, to } = parseDateRange(req.query);
    const users = await db.collection("users").find({}).toArray();

    let activeInRange = 0;
    let inactiveInRange = 0;
    let banned = 0;

    users.forEach((u) => {
      if (u.isBanned) {
        banned++;
        return;
      }
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
      if (lastLogin && (!from || lastLogin >= from) && (!to || lastLogin <= to)) {
        activeInRange++;
      } else {
        inactiveInRange++;
      }
    });

    res.json({ activeInRange, inactiveInRange, banned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/total-comments
// Placeholder for total comments count
router.get("/total-comments", async (req, res) => {
  try {
    const db = getDB();
    const hasCollection = (await db.listCollections({ name: "comments" }).toArray()).length > 0;
    if (hasCollection) {
      const total = await db.collection("comments").countDocuments();
      return res.json({ totalComments: total });
    }
    res.json({ totalComments: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
