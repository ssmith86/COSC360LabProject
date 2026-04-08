const User = require("../../models/User");
const SavedEvent = require("../../models/SavedEvent");

module.exports = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await SavedEvent.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
