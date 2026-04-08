const User = require("../../models/User");

module.exports = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarPath = "/uploads/" + req.file.filename;
    await User.findByIdAndUpdate(req.params.id, { avatar: avatarPath });
    res.json({ avatar: avatarPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
