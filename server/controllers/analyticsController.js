const Event = require("../models/Event");
const SavedEvent = require("../models/SavedEvent");
const Comment = require("../models/Comment");
const User = require("../models/User");

function parseDateRange(query) {
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;
  if (to) to.setHours(23, 59, 59, 999);
  return { from, to };
}

function getGranularity(from, to) {
  if (!from || !to) return "month";
  const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 31 ? "day" : "month";
}

function dateToKey(d, granularity) {
  if (granularity === "day")
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

exports.getEventTrends = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);
    const filter = {};
    if (from || to) {
      filter.publishedAt = {};
      if (from) filter.publishedAt.$gte = from;
      if (to) filter.publishedAt.$lte = to;
    }
    const events = await Event.find(filter);
    const counts = {};
    events.forEach((e) => {
      if (!e.publishedAt) return;
      const key = dateToKey(new Date(e.publishedAt), granularity);
      counts[key] = (counts[key] || 0) + 1;
    });
    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPopularEvents = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const matchStage = {};
    if (from || to) {
      matchStage.savedAt = {};
      if (from) matchStage.savedAt.$gte = from;
      if (to) matchStage.savedAt.$lte = to;
    }
    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      { $group: { _id: "$eventId", saveCount: { $sum: 1 } } },
      { $sort: { saveCount: -1 } },
      { $limit: 10 },
    ];
    const topSaved = await SavedEvent.aggregate(pipeline);
    const eventIds = topSaved.map((s) => s._id);
    const events = await Event.find({ _id: { $in: eventIds } });
    const eventMap = {};
    events.forEach((e) => {
      eventMap[e._id.toString()] = e;
    });
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
};

exports.getLocationDistribution = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
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
};

exports.getUserGrowth = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }
    const users = await User.find(filter);
    const counts = {};
    users.forEach((u) => {
      if (!u.createdAt) return;
      const key = dateToKey(new Date(u.createdAt), granularity);
      counts[key] = (counts[key] || 0) + 1;
    });
    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventTotalSummary = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalSaves = await SavedEvent.countDocuments();
    const totalComments = await Comment.countDocuments();
    res.json({ totalEvents, totalSaves, totalComments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventPeriodSummary = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const eventFilter = {};
    if (from || to) {
      eventFilter.publishedAt = {};
      if (from) eventFilter.publishedAt.$gte = from;
      if (to) eventFilter.publishedAt.$lte = to;
    }
    const publishedInPeriod = await Event.countDocuments(eventFilter);

    const saveFilter = {};
    if (from || to) {
      saveFilter.savedAt = {};
      if (from) saveFilter.savedAt.$gte = from;
      if (to) saveFilter.savedAt.$lte = to;
    }
    const savedInPeriod = await SavedEvent.countDocuments(saveFilter);

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
};

exports.getEventStartTrends = async (req, res) => {
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
      if (!e.startDate) return;
      const key = dateToKey(new Date(e.startDate), granularity);
      counts[key] = (counts[key] || 0) + 1;
    });
    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSaveTrends = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);
    const filter = {};
    if (from || to) {
      filter.savedAt = {};
      if (from) filter.savedAt.$gte = from;
      if (to) filter.savedAt.$lte = to;
    }
    const saves = await SavedEvent.find(filter);
    const counts = {};
    saves.forEach((s) => {
      if (!s.savedAt) return;
      const key = dateToKey(new Date(s.savedAt), granularity);
      counts[key] = (counts[key] || 0) + 1;
    });
    const result = Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
    res.json({ granularity, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMostActiveCreators = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const filter = {};
    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = from;
      if (to) filter.startDate.$lte = to;
    }
    const events = await Event.find(filter).populate(
      "ownerId",
      "userName firstName lastName",
    );
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
};

exports.getMostPopularCreators = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const matchStage = {};
    if (from || to) {
      matchStage.savedAt = {};
      if (from) matchStage.savedAt.$gte = from;
      if (to) matchStage.savedAt.$lte = to;
    }
    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $group: { _id: "$event.ownerId", totalSaves: { $sum: 1 } } },
      { $sort: { totalSaves: -1 } },
      { $limit: 10 },
    ];
    const topOwners = await SavedEvent.aggregate(pipeline);
    const ownerIds = topOwners.map((o) => o._id);
    const users = await User.find({ _id: { $in: ownerIds } }).select(
      "userName firstName lastName",
    );
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u.userName;
    });
    const result = topOwners.map((o) => ({
      creator: userMap[o._id?.toString()] || "Unknown",
      totalSaves: o.totalSaves,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTotalSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeUsers = totalUsers - bannedUsers;
    res.json({ totalUsers, activeUsers, bannedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPeriodSummary = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const users = await User.find({});
    let activeInPeriod = 0;
    let inactiveInPeriod = 0;
    let bannedInPeriod = 0;
    users.forEach((u) => {
      if (u.isBanned) {
        const bannedAt = u.lastBannedAt ? new Date(u.lastBannedAt) : null;
        if (bannedAt && (!from || bannedAt >= from) && (!to || bannedAt <= to))
          bannedInPeriod++;
        return;
      }
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
      if (lastLogin && (!from || lastLogin >= from) && (!to || lastLogin <= to))
        activeInPeriod++;
      else inactiveInPeriod++;
    });
    res.json({ activeInPeriod, inactiveInPeriod, bannedInPeriod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTotalComments = async (req, res) => {
  try {
    const total = await Comment.countDocuments();
    res.json({ totalComments: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHotEventsTrend = async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const granularity = getGranularity(from, to);

    // Find top 5 events by save count within the date range
    const matchStage = {};
    if (from || to) {
      matchStage.savedAt = {};
      if (from) matchStage.savedAt.$gte = from;
      if (to) matchStage.savedAt.$lte = to;
    }
    const topPipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      { $group: { _id: "$eventId", saveCount: { $sum: 1 } } },
      { $sort: { saveCount: -1 } },
      { $limit: 5 },
    ];
    const topEvents = await SavedEvent.aggregate(topPipeline);
    if (topEvents.length === 0) {
      return res.json({ granularity, events: [], data: [] });
    }

    const topEventIds = topEvents.map((e) => e._id);
    const events = await Event.find({ _id: { $in: topEventIds } }).select("title");
    const eventMap = {};
    events.forEach((e) => {
      eventMap[e._id.toString()] = e.title;
    });

    // Get all saves for those events in the period
    const savesFilter = { eventId: { $in: topEventIds } };
    if (from || to) {
      savesFilter.savedAt = {};
      if (from) savesFilter.savedAt.$gte = from;
      if (to) savesFilter.savedAt.$lte = to;
    }
    const saves = await SavedEvent.find(savesFilter);

    // Build pivot: { label -> { eventName -> count } }
    const pivot = {};
    saves.forEach((s) => {
      if (!s.savedAt) return;
      const key = dateToKey(new Date(s.savedAt), granularity);
      const name = eventMap[s.eventId?.toString()] || "Unknown";
      if (!pivot[key]) pivot[key] = {};
      pivot[key][name] = (pivot[key][name] || 0) + 1;
    });

    const eventNames = topEventIds
      .filter((id) => eventMap[id.toString()])
      .map((id) => eventMap[id.toString()]);

    const data = Object.entries(pivot)
      .map(([label, counts]) => ({ label, ...counts }))
      .sort((a, b) => a.label.localeCompare(b.label));

    res.json({ granularity, events: eventNames, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
