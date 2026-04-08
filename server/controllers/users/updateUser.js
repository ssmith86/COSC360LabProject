const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Event = require("../../models/Event");
const SavedEvent = require("../../models/SavedEvent");
const Notification = require("../../models/Notification");

module.exports = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      email,
      isAdmin,
      isBanned,
      password,
      currentPassword,
    } = req.body;
    const updates = {};
    const userId = req.params.id;
    const existingUser = await User.findById(userId);

    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (userName !== undefined) updates.userName = userName;
    if (email !== undefined) updates.email = email;
    if (isAdmin !== undefined) updates.isAdmin = isAdmin;

    if (isBanned !== undefined) {
      updates.isBanned = isBanned;

      if (isBanned && !existingUser.isBanned) {
        updates.bannedAt = new Date();
        await Notification.create({
          userId,
          type: "account_banned",
          category: "system",
          message:
            "Your account has been banned. All your events have been cancelled.",
          isRead: false,
        });
        const userEvents = await Event.find({ ownerId: userId });
        if (userEvents.length > 0) {
          const eventIds = userEvents.map((e) => e._id);
          await Event.updateMany(
            { ownerId: userId },
            { $set: { status: "cancelled" } },
          );
          const savedRecords = await SavedEvent.find({
            eventId: { $in: eventIds },
            userId: { $ne: new mongoose.Types.ObjectId(userId) },
          });
          if (savedRecords.length > 0) {
            await Notification.insertMany(
              savedRecords.map((record) => {
                const event = userEvents.find((e) =>
                  e._id.equals(record.eventId),
                );
                return {
                  userId: record.userId,
                  type: "event_cancelled",
                  category: "system",
                  message: `The event "${event?.title || "An event"}" has been cancelled.`,
                  relatedEventId: record.eventId,
                  isRead: false,
                };
              }),
            );
          }
        }
      } else if (!isBanned && existingUser.isBanned) {
        updates.bannedAt = null;
        await Notification.create({
          userId,
          type: "account_unbanned",
          category: "system",
          message:
            "Your account has been unbanned. Your events have been restored.",
          isRead: false,
        });
        const cancelledEvents = await Event.find({
          ownerId: userId,
          status: "cancelled",
        });
        if (cancelledEvents.length > 0) {
          const eventIds = cancelledEvents.map((e) => e._id);
          await Event.updateMany(
            { _id: { $in: eventIds } },
            { $set: { status: "published" } },
          );
          const savedRecords = await SavedEvent.find({
            eventId: { $in: eventIds },
            userId: { $ne: new mongoose.Types.ObjectId(userId) },
          });
          if (savedRecords.length > 0) {
            await Notification.insertMany(
              savedRecords.map((record) => {
                const event = cancelledEvents.find((e) =>
                  e._id.equals(record.eventId),
                );
                return {
                  userId: record.userId,
                  type: "event_restored",
                  category: "system",
                  message: `The event "${event?.title || "An event"}" has been restored.`,
                  relatedEventId: record.eventId,
                  isRead: false,
                };
              }),
            );
          }
        }
      }
    }

    if (password) {
      if (currentPassword) {
        const match = await bcrypt.compare(
          currentPassword,
          existingUser.password,
        );
        if (!match)
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(userId, updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
