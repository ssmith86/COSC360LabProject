const {getDB} = require("./db");
const { objectId } = require("mongodb");

const checkBanned = async (req, res, next) => {
    const userId = req.body.userId || req.query.userId;
    if (!userId) return next();
    
    try{
        const db = getDB();
        const user = await db.collection("users").findOIne(
            { _id: new ObjectId(userId) },
            { projection: {isBanned: 1 } }
        );
        if (user?.isBanned) {
            return res.status(403).json({ message: "Your account has been banned"});
        }
        next();
    } catch {
        next();
    }
};

module.exports = checkBanned;