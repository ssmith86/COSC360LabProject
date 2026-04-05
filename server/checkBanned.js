const mongoose = require("mongoose");
const User = require("./models/User");

const checkBanned = async (req, res, next) => {
    const userId = req.body?.userId || req.query?.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return next();

    try {
        const user = await User.findById(userId).select("isBanned");
        if (user?.isBanned) {
            return res.status(403).json({ message: "Your account has been banned" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = checkBanned;