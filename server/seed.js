// seed sample users and events into cosc360db
// uses mongoose models to insert data matching the new schema (but we may not use this)

// usage:
// 1. cd server
// 2. node seed.js

const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Event = require("./models/Event");
const SavedEvent = require("./models/SavedEvent");

// get sample data
const sampleData = require("./SampleData.json");

// upsert helper: returns { doc, action } where action is "Created" or "Updated"
async function upsert(Model, filter, update, setOnInsert = {}) {
  const existing = await Model.findOne(filter);
  const doc = await Model.findOneAndUpdate(
    filter,
    { $set: update, ...(Object.keys(setOnInsert).length ? { $setOnInsert: setOnInsert } : {}) },
    { upsert: true, returnDocument: "after" }
  );
  return { doc, action: existing ? "Updated" : "Created" };
}

async function seed() {
  // connect to cosc360db using mongoose
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "cosc360db",
  });
  console.log(">> Connected to MongoDB");

  // seed users, skip if already exists (by email)
  const createdUsers = [];
  for (const userData of sampleData.users) {
    let user = await User.findOne({ email: userData.email });
    if (user) {
      console.log(`  Skipped user: ${user.userName} (already exists)`);
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      user = await User.create({
        userName: userData.userName,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        createdAt: new Date(),
      });
      console.log(`  Created user: ${user.userName} (${user._id})`);
    }
    createdUsers.push(user);
  }

  // seed events: upsert by title + ownerId
  const createdEvents = [];
  for (const eventData of sampleData.events) {
    const owner = createdUsers[eventData.ownerIndex];
    const filter = { title: eventData.title, ownerId: owner._id };
    const update = {
      description: eventData.description,
      category: eventData.category,
      status: eventData.status,
      imageUrl: eventData.imageUrl,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      location: eventData.location,
    };
    if (eventData.publishedAt) {
      update.publishedAt = new Date(eventData.publishedAt);
    } else if (eventData.status === "published") {
      update.publishedAt = new Date();
    }

    const { doc: event, action } = await upsert(Event, filter, update, {
      createdAt: eventData.publishedAt ? new Date(eventData.publishedAt) : new Date(),
    });
    createdEvents.push(event);
    console.log(`  ${action} event: 「${event.title}」 owned by ${owner.userName} (${event._id})`);
  }

  // seed saved events: upsert by userId + eventId
  for (const saveData of (sampleData.savedEvents || [])) {
    const user = createdUsers[saveData.userIndex];
    const event = createdEvents[saveData.eventIndex];
    const filter = { userId: user._id, eventId: event._id };
    const update = { savedAt: new Date(saveData.savedAt) };

    const { action } = await upsert(SavedEvent, filter, update);
    console.log(`  ${action} saved event: ${user.userName} saved 「${event.title}」`);
  }

  console.log(">>> Sample data seeded successfully!");
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
