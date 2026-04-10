const mongoose = require("mongoose");
require("dotenv").config();
const { EJSON } = require("bson");

function loadJSON(filePath) {
  const fs = require("fs");
  try {
    const content = fs.readFileSync(filePath, "utf8").trim();
    if (!content) return [];
    return EJSON.parse(content);
  } catch (e) {
    return [];
  }
}

const users = loadJSON("./data/users.json");
const events = loadJSON("./data/events.json");
const savedEvents = loadJSON("./data/savedEvents.json");
const notifications = loadJSON("./data/notifications.json");
const comments = loadJSON("./data/comments.json");

async function seedAll() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "cosc360db" });
  console.log(">> Connected to MongoDB");

  const db = mongoose.connection.db;

  const collections = [
    { name: "users", data: users },
    { name: "events", data: events },
    { name: "savedevents", data: savedEvents },
    { name: "notifications", data: notifications },
    { name: "comments", data: comments },
  ];

  for (const { name, data } of collections) {
    if (!data.length) continue;
    const count = await db.collection(name).countDocuments();
    if (count === 0) {
      await db.collection(name).insertMany(data);
      console.log(`  Seeded ${data.length} documents into ${name}`);
    } else {
      console.log(`  Skipped ${name} (already has data)`);
    }
  }

  console.log(">>> Seed complete");
  await mongoose.connection.close();
}

seedAll().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
