const express = require("express");
const router = express.Router();
const Event = require("./models/Event");
const SavedEvent = require("./models/SavedEvent");
const Comment = require("./models/Comment");
const User = require("./models/User");

// Helper: parse from/to query params into Date objects
function parseDateRange(query) {
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;
  if (to) to.setHours(23, 59, 59, 999);
  return { from, to };
}

// Helper: determine grouping granularity based on date range
// <= 31 days → "day", > 31 days → "month" (using 31 because 1M preset spans 30 days + end-of-day padding which is 23:59:59.999)
function getGranularity(from, to) {
  if (!from || !to) return "month";
  const diffMs = to.getTime() - from.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 31 ? "day" : "month";
}

// Helper: convert a Date to a string key based on granularity
// "day" → "2026-04-05", "month" → "2026-04"
function dateToKey(d, granularity) {
  if (granularity === "day") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// GET /api/analytics/event-trends
// Returns event count grouped by day or month, filtered by date range
// uses publishedAt (when the event was published) for grouping
router.get("/event-trends", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);

    // build query filter for date range
    const filter = {};
    if (from || to) {
      filter.publishedAt = {};
      if (from) filter.publishedAt.$gte = from;
      if (to) filter.publishedAt.$lte = to;
    }

    const events = await Event.find(filter);

    const counts = {};
    events.forEach((e) => {
      // use publishedAt for trend grouping
      const date = e.publishedAt;
      if (!date) return;
      const d = new Date(date);
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
// Returns top 10 events ranked by number of saves, filtered by save date
router.get("/popular-events", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);

    const matchStage = {};
    if (from || to) {
      matchStage.savedAt = {};
      if (from) matchStage.savedAt.$gte = from;
      if (to) matchStage.savedAt.$lte = to;
    }

    // aggregate savedEvents to count saves per event
    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      { $group: { _id: "$eventId", saveCount: { $sum: 1 } } },
      { $sort: { saveCount: -1 } },
      { $limit: 10 },
    ];
    const topSaved = await SavedEvent.aggregate(pipeline);

    // fetch event details for top saved events
    const eventIds = topSaved.map((s) => s._id);
    const events = await Event.find({ _id: { $in: eventIds } });

    const eventMap = {};
    events.forEach((e) => { eventMap[e._id.toString()] = e; });

    const result = topSaved
      .filter((s) => eventMap[s._id.toString()])
      .map((s) => ({
        eventId: s._id,
        eventName: eventMap[s._id.toString()]?.title || "Unknown",
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
    const { from, to } = parseDateRange(req.query);

    // build query filter for date range using startDate
    const filter = {};
    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = from;
      if (to) filter.startDate.$lte = to;
    }

    const events = await Event.find(filter);

    const counts = {};
    events.forEach((e) => {
      const city = e.location?.city || "Unknown";
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
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);

    // build query filter for createdAt date range
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    const users = await User.find(filter);

    const counts = {};
    users.forEach((u) => {
      const date = u.createdAt;
      if (!date) return;
      const d = new Date(date);
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

// GET /api/analytics/event-total-summary
// Returns total counts of events, saves, and comments for admin summary cards
router.get("/event-total-summary", async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalSaves = await SavedEvent.countDocuments();
    const totalComments = await Comment.countDocuments();

    res.json({ totalEvents, totalSaves, totalComments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/event-period-summary
// Returns event activity metrics within the requested date range
router.get("/event-period-summary", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);

    // count events in period by publishedAt
    const eventFilter = {};
    if (from || to) {
      eventFilter.publishedAt = {};
      if (from) eventFilter.publishedAt.$gte = from;
      if (to) eventFilter.publishedAt.$lte = to;
    }
    const publishedInPeriod = await Event.countDocuments(eventFilter);

    // count saves in period by savedAt
    const saveFilter = {};
    if (from || to) {
      saveFilter.savedAt = {};
      if (from) saveFilter.savedAt.$gte = from;
      if (to) saveFilter.savedAt.$lte = to;
    }
    const savedInPeriod = await SavedEvent.countDocuments(saveFilter);

    // count comments in period by createdAt
    const commentFilter = {};
    if (from || to) {
      commentFilter.createdAt = {};
      if (from) commentFilter.createdAt.$gte = from;
      if (to) commentFilter.createdAt.$lte = to;
    }
    const commentedInPeriod = await Comment.countDocuments(commentFilter);

    res.json({ publishedInPeriod, savedInPeriod, commentedInPeriod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/event-start-trends
// Returns event count grouped by startDate, filtered by date range
router.get("/event-start-trends", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);

    const filter = {};
    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = from;
      if (to) filter.startDate.$lte = to;
    }

    const events = await Event.find(filter);

    const counts = {};
    events.forEach((e) => {
      const date = e.startDate;
      if (!date) return;
      const d = new Date(date);
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

// GET /api/analytics/save-trends
// Returns save count grouped by day or month, filtered by date range
router.get("/save-trends", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);

    // build query filter for savedAt date range
    const filter = {};
    if (from || to) {
      filter.savedAt = {};
      if (from) filter.savedAt.$gte = from;
      if (to) filter.savedAt.$lte = to;
    }

    const saves = await SavedEvent.find(filter);

    const counts = {};
    saves.forEach((s) => {
      const date = s.savedAt;
      if (!date) return;
      const d = new Date(date);
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
// Returns top 10 users by number of events created, filtered by date range
router.get("/top-creators", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);

    // build query filter for startDate date range
    const filter = {};
    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = from;
      if (to) filter.startDate.$lte = to;
    }

    const events = await Event.find(filter).populate("ownerId", "userName firstName lastName");

    // count events per creator
    const counts = {};
    events.forEach((e) => {
      const creator = e.ownerId?.userName || "Unknown";
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

// GET /api/analytics/user-total-summary (admin)
// Returns total user counts: total, active (not banned), and banned
router.get("/user-total-summary", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeUsers = totalUsers - bannedUsers;

    res.json({ totalUsers, activeUsers, bannedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/user-period-summary (admin)
// Returns user activity metrics within the requested date range
// active = logged in during period, banned = banned during period
router.get("/user-period-summary", async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const users = await User.find({});

    let activeInPeriod = 0;
    let inactiveInPeriod = 0;
    let bannedInPeriod = 0;

    users.forEach((u) => {
      if (u.isBanned) {
        const bannedAt = u.lastBannedAt ? new Date(u.lastBannedAt) : null;
        if (bannedAt && (!from || bannedAt >= from) && (!to || bannedAt <= to)) {
          bannedInPeriod++;
        }
        return;
      }
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
      if (lastLogin && (!from || lastLogin >= from) && (!to || lastLogin <= to)) {
        activeInPeriod++;
      } else {
        inactiveInPeriod++;
      }
    });

    res.json({ activeInPeriod, inactiveInPeriod, bannedInPeriod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/total-comments
// Returns total number of comments
router.get("/total-comments", async (req, res) => {
  try {
    const total = await Comment.countDocuments();
    res.json({ totalComments: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
