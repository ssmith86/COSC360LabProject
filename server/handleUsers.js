const express = require("express");
const router = express.Router();
const { getDB } = require("./db");
const { ObjectId } = require("mongodb");


router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();
        await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id )});
        res.json({success: true})
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { userName, isAdmin, isBanned, password } = req.body;
        const updates = { userName, isAdmin, isBanned };
        if (password) {
            updates.password = password;
        }
        await db.collection("users").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
