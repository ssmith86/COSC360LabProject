const Event = require("../../models/Event");

module.exports = async (req, res) => {
  try {
    const now = new Date();
    const results = await Event.find({
      startDate: { $gte: now },
      status: { $nin: ["cancelled", "archived"] },
    }).sort({ startDate: 1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
