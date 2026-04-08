const Event = require("../../models/Event");

module.exports = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 30);
    const results = await Event.find({
      startDate: { $gte: now, $lte: sevenDaysLater },
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
