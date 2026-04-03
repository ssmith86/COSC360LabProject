const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getDB } = require("./db");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed"), false);
};

const upload = multer({ storage, fileFilter });


router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/search", async (req, res) => {
    const searchTerm = req.query.q || "";
    if (!searchTerm.trim()) return res.json({ users: [], events: [] });
    try {
        const db = getDB();
        const regex = { $regex: searchTerm, $options: "i" };

        const users = await db.collection("users").find({
            $or: [
                { userName: regex },
                { email: regex },
                { firstName: regex },
                { lastName: regex },
            ]
        }, { projection: { password: 0 } }).toArray();

        const events = await db.collection("events").find({
            $or: [
                { "event.name": regex },
                { "owner.name": regex },
                { "description": regex },
            ]
        }).toArray();

        res.json({ users, events });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const db = getDB();
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(req.params.id) },
            { projection: { password: 0 } }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();
        await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
        await db.collection("savedEvents").deleteMany({ userId: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/avatar", upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const db = getDB();
        const avatarPath = "/uploads/" + req.file.filename;
        await db.collection("users").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { avatar: avatarPath } }
        );
        res.json({ avatar: avatarPath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { firstName, lastName, userName, email, isAdmin, isBanned, password, currentPassword } = req.body;
        const updates = {};
        const userId = new ObjectId(req.params.id);
        const existingUser = await db.collection("users").findOne({ _id: userId });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (firstName !== undefined) updates.firstName = firstName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (userName !== undefined) updates.userName = userName;
        if (email !== undefined) updates.email = email;
        if (isAdmin !== undefined) updates.isAdmin = isAdmin;
        if (isBanned !== undefined) {
            updates.isBanned = isBanned;
            if (isBanned && !existingUser.isBanned) {
                updates.bannedAt = new Date();
            } else if (!isBanned && existingUser.isBanned) {
                updates.bannedAt = null;
            }
        }

        // If changing password, verify current password first
        if (password) {
            if (currentPassword) {
                const match = await bcrypt.compare(currentPassword, existingUser.password);
                if (!match) {
                    return res.status(401).json({ message: "Current password is incorrect" });
                }
            }
            updates.password = await bcrypt.hash(password, 10);
        }

        await db.collection("users").updateOne(
            { _id: userId },
            { $set: updates }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
