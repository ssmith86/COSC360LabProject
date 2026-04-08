const Event = require("../../models/Event");

module.exports = async (req, res) => {
  const ownerId = req.query.ownerId || "";
  if (!ownerId)
    return res
      .status(400)
      .json({ message: "ownerId query parameter is required" });
  try {
    const results = await Event.find({ ownerId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
