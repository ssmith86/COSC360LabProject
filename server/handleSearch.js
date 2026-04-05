// extract the logic of handleSearch out of server.js
const express = require("express");
const router = express.Router();
const Event = require("./models/Event");
const User = require("./models/User");

router.get("/", async (req, res) => {
  const searchTerm = req.query.q || "";

  try {
    const regex = { $regex: searchTerm, $options: "i" };

    // find users whose userName matches, to search events by owner
    const matchingUsers = await User.find({ userName: regex }).select("_id");
    const matchingUserIds = matchingUsers.map(u => u._id);

    const results = await Event.find({
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
        { "location.country": regex },
        { "location.province": regex },
        { "location.city": regex },
        { "location.street": regex },
        { ownerId: { $in: matchingUserIds } },
      ]
    }).populate("ownerId", "userName firstName lastName");

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
