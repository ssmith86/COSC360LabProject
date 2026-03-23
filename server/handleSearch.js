// extract the logic of handleSearch out of server.js
const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

router.get("/", async (req, res) => {
  const searchTerm = req.query.q?.toLowerCase() || "";

  try {
    // get databse cosc360db
    const db = getDB();
    // get all events from the collection events in our cosc360db MongoDB
    const allEvents = await db.collection("events").find({}).toArray();

    const results = allEvents.filter(
      (item) =>
        item.event.name.toLowerCase().includes(searchTerm) ||
        item.owner.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.event.location.country.toLowerCase().includes(searchTerm) ||
        item.event.location.province.toLowerCase().includes(searchTerm) ||
        item.event.location.city.toLowerCase().includes(searchTerm) ||
        item.event.location.street.toLowerCase().includes(searchTerm) ||
        item.event.location.address.toString().includes(searchTerm) ||
        item.event.start_date.toLowerCase().includes(searchTerm),
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
