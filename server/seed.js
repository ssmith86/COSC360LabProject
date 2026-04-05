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

// get sample data
const sampleData = require("./SampleData.json");

async function seed() {
  // connect to cosc360db using mongoose
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "cosc360db",
  });
  console.log(">> Connected to MongoDB");

  // clear existing seed events only
  await Event.deleteMany({});
  console.log(">> Cleared existing events");

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

  // seed events with real user ObjectId references
  for (const eventData of sampleData.events) {
    const owner = createdUsers[eventData.ownerIndex];
    const event = await Event.create({
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      status: eventData.status,
      ownerId: owner._id,
      imageUrl: eventData.imageUrl,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      location: eventData.location,
      createdAt: new Date(),
    });
    console.log(`  Created event: "${event.title}" owned by ${owner.firstName} (${event._id})`);
  }

  console.log(">>> Sample data seeded successfully!");
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
