const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const User = require("./models/User");
const Event = require("./models/Event");
const SavedEvent = require("./models/SavedEvent");
const Notification = require("./models/Notification");

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
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/search", async (req, res) => {
    const searchTerm = req.query.q || "";
    if (!searchTerm.trim()) return res.json({ users: [], events: [] });
    try {
        const regex = { $regex: searchTerm, $options: "i" };

        const users = await User.find({
            $or: [
                { userName: regex },
                { email: regex },
                { firstName: regex },
                { lastName: regex },
            ]
        }).select("-password");

        const events = await Event.find({
            $or: [
                { title: regex },
                { description: regex },
            ]
        });

        res.json({ users, events });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
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
        await User.findByIdAndDelete(req.params.id);
        await SavedEvent.deleteMany({ userId: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/avatar", upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const avatarPath = "/uploads/" + req.file.filename;
        await User.findByIdAndUpdate(req.params.id, { avatar: avatarPath });
        res.json({ avatar: avatarPath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { firstName, lastName, userName, email, isAdmin, isBanned, password, currentPassword } = req.body;
        const updates = {};
        const userId = req.params.id;
        const existingUser = await User.findById(userId);

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

                // notify the banned user
                await Notification.create({
                    userId,
                    type: "account_banned",
                    category: "system",
                    message: "Your account has been banned. All your events have been cancelled.",
                    isRead: false,
                });

                // Cancel all events owned by this user
                const userEvents = await Event.find({ ownerId: userId });

                if (userEvents.length > 0) {
                    const eventIds = userEvents.map(e => e._id);

                    await Event.updateMany(
                        { ownerId: userId },
                        { $set: { status: "cancelled" } }
                    );

                    // Find all users who saved these events (excluding the banned user)
                    const savedRecords = await SavedEvent.find({
                        eventId: { $in: eventIds },
                        userId: { $ne: new mongoose.Types.ObjectId(userId) }
                    });

                    if (savedRecords.length > 0) {
                        const notifications = savedRecords.map(record => {
                            const event = userEvents.find(e => e._id.equals(record.eventId));
                            return {
                                userId: record.userId,
                                type: "event_cancelled",
                                category: "system",
                                message: `The event "${event?.title || "An event"}" has been cancelled.`,
                                relatedEventId: record.eventId,
                                isRead: false,
                            };
                        });
                        await Notification.insertMany(notifications);
                    }
                }
            } else if (!isBanned && existingUser.isBanned) {
                updates.bannedAt = null;

                // notify the unbanned user
                await Notification.create({
                    userId,
                    type: "account_unbanned",
                    category: "system",
                    message: "Your account has been unbanned. Your events have been restored.",
                    isRead: false,
                });

                // restore all events that were cancelled due to this user being banned
                const cancelledEvents = await Event.find({ ownerId: userId, status: "cancelled" });
                if (cancelledEvents.length > 0) {
                    const eventIds = cancelledEvents.map(e => e._id);

                    await Event.updateMany(
                        { _id: { $in: eventIds } },
                        { $set: { status: "published" } }
                    );

                    // notify users who saved these events
                    const savedRecords = await SavedEvent.find({
                        eventId: { $in: eventIds },
                        userId: { $ne: new mongoose.Types.ObjectId(userId) }
                    });

                    if (savedRecords.length > 0) {
                        const notifications = savedRecords.map(record => {
                            const event = cancelledEvents.find(e => e._id.equals(record.eventId));
                            return {
                                userId: record.userId,
                                type: "event_restored",
                                category: "system",
                                message: `The event "${event?.title || "An event"}" has been restored.`,
                                relatedEventId: record.eventId,
                                isRead: false,
                            };
                        });
                        await Notification.insertMany(notifications);
                    }
                }
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

        await User.findByIdAndUpdate(userId, updates);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
