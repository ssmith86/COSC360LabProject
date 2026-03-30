const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

// GET /api/events/upcoming
// this is used for the MyEventsPage.jsx to get the Upcoming Events in next 7 days
// returns events with start_date within the next 7 days
router.get("/upcoming", async (req, res) => {
  try {
    const db = getDB();

    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    const results = await db
      .collection("events")
      .find({
        "event.start_date": {
          $gte: now.toISOString(),
          $lte: sevenDaysLater.toISOString(),
        },
      })
      .toArray();

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/myevents?ownerName=Sam Smith
// get events created by the given owner name, for MyEventsPage.jsx's My Events
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

// GET /api/events/myevents?ownerId
router.get("/myevents", async (req, res) => {
  const ownerId = req.query.ownerId || "";
  const ownerName = req.query.ownerName || "";

  if (!ownerId && !ownerName) {
    return res
      .status(400)
      .json({ message: "ownerId or ownerName query parameter is required" });
  }

  try {
    const db = getDB();

    // use ownerId first, otherwise fall back to ownerName
    const query = ownerId
      ? { "owner.id": ownerId }
      : { "owner.name": ownerName };

    const results = await db.collection("events").find(query).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
