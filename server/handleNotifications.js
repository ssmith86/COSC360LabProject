const express = require("express");
const router = express.Router();
const { getDB } = require("./db");
const { ObjectId } = require("mongodb");

// GET /api/notifications?userId=...
// Returns all notifications for a user
router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    try {
        const db = getDB();
        const notifications = await db.collection("notifications")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/notifications/read-all  (must be before /:id)
// Mark all notifications as read for a user
router.patch("/read-all", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    try {
        const db = getDB();
        await db.collection("notifications").updateMany(
            { userId, read: false },
            { $set: { read: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/notifications/:id
// Mark a single notification as read
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid notification id" });

    try {
        const db = getDB();
        await db.collection("notifications").updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
