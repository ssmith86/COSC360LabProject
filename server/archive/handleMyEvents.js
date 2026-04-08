const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET /api/events/upcoming
// this is used for the MyEventsPage.jsx to get the Upcoming Events in next 7 days
// returns events with startDate within the next 7 days
router.get("/upcoming", async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 30);

    const results = await Event.find({
      startDate: {
        $gte: now,
        $lte: sevenDaysLater,
      },
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: right now we do not have any login functionality to tell user
// once, implemented, we need to replace ownerName with owner id (user id) of the event
// router.get("/myevents", async (req, res) => {
//   const ownerName = req.query.ownerName || "";

//   if (!ownerName) {
//     return res
//       .status(400)
//       .json({ message: "ownerName query param is required" });
//   }

//   try {
//     const db = getDB();

//     const results = await db
//       .collection("events")
//       .find({
//         "owner.name": ownerName,
//       })
//       .toArray();

//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// GET /api/events/myevents?ownerId=xxx
// get events created by the given ownerId
router.get("/myevents", async (req, res) => {
  const ownerId = req.query.ownerId || "";

  if (!ownerId) {
    return res
      .status(400)
      .json({ message: "ownerId query parameter is required" });
  }

  try {
    const results = await Event.find({ ownerId: ownerId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
