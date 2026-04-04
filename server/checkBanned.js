const {getDB} = require("./db");
const { ObjectId } = require("mongodb");

const checkBanned = async (req, res, next) => {
    const userId = req.body?.userId || req.query?.userId;
    if (!userId || !ObjectId.isValid(userId)) return next();

    try {
        const db = getDB();
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { isBanned: 1 } }
        );
        if (user?.isBanned) {
            return res.status(403).json({ message: "Your account has been banned" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = checkBanned;