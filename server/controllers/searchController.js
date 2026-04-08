const Event = require("../models/Event");
const User = require("../models/User");

module.exports = async (req, res) => {
  const searchTerm = req.query.q || "";
  try {
    const regex = { $regex: searchTerm, $options: "i" };
    const matchingUsers = await User.find({ userName: regex }).select("_id");
    const matchingUserIds = matchingUsers.map((u) => u._id);
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
      ],
    }).populate("ownerId", "userName firstName lastName");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
