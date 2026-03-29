const express = require("express");
const router = express.Router();
const { getDB } = require("./db");

router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
