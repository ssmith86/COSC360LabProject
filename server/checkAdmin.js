const mongoose = require("mongoose");
const User = require("./models/User");

const checkAdmin = async (req, res, next) => {
    const userId = req.body?.userId || req.query?.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const user = await User.findById(userId).select("isAdmin");
        if (!user?.isAdmin) {
            return res.status(403).json({ message: "Forbidden: admin access required" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = checkAdmin;
