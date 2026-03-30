// extract the logic of handleSearch out of server.js
const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

router.get("/", async (req, res) => {
  const searchTerm = req.query.q || "";

  try {
    const db = getDB();
    const results = await db.collection("events").find({
      $or: [
        { "event.name": { $regex: searchTerm, $options: "i" } },
        { "owner.name": { $regex: searchTerm, $options: "i" } },
        { "description": { $regex: searchTerm, $options: "i" } },
        { "event.location.country": { $regex: searchTerm, $options: "i" } },
        { "event.location.province": { $regex: searchTerm, $options: "i" } },
        { "event.location.city": { $regex: searchTerm, $options: "i" } },
        { "event.location.street": { $regex: searchTerm, $options: "i" } },
        { "event.start_date": { $regex: searchTerm, $options: "i" } },
      ]
    }).toArray();

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
