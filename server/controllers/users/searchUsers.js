const User = require("../../models/User");
const Event = require("../../models/Event");

module.exports = async (req, res) => {
  const searchTerm = req.query.q || "";
  if (!searchTerm.trim()) return res.json({ users: [], events: [] });
  try {
    const regex = { $regex: searchTerm, $options: "i" };
    const users = await User.find({
      $or: [
        { userName: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex },
      ],
    }).select("-password");
    const events = await Event.find({
      $or: [{ title: regex }, { description: regex }],
    });
    res.json({ users, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
