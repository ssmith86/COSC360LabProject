// one-time migration script to convert old mongoDB data and structure to match the new mongoose schema

// changes as below:
// old event structure - 
//   { owner: { name, id }, event: { name, start_date, end_date, image, location, category }, description }
// mew event structure - 
//   { title, ownerId, startDate, endDate, imageUrl, location, category, description, status, ... }
// also migrates savedEvents and notifications to use ObjectId refs instead of strings (for Ids)

// usage: 
// 1. cd server
// 2. node migrateToMongoose.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

async function migrate() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("cosc360db");

  // migrate events collection
  console.log(">> Migrating events...");
  const events = await db.collection("events").find({}).toArray();
  let eventMigrated = 0;

  for (const e of events) {
    // skip if already migrated (has title field)
    if (e.title !== undefined) {
      console.log(`  Skipping event ${e._id} (already migrated)`);
      continue;
    }

    const updated = {
      title: e.event?.name || "",
      description: e.description || "",
      category: e.event?.category || "",
      status: e.status || "published",
      imageUrl: e.event?.image || "",
      startDate: e.event?.start_date ? new Date(e.event.start_date) : new Date(),
      endDate: e.event?.end_date ? new Date(e.event.end_date) : new Date(),
      location: {
        address: e.event?.location?.address || "",
        street: e.event?.location?.street || "",
        city: e.event?.location?.city || "",
        province: e.event?.location?.province || "",
        country: e.event?.location?.country || "",
      },
      createdAt: e.createdAt || new Date(),
      publishedAt: null,
      updatedAt: null,
    };

    // convert owner.id string to ObjectId for ownerId ref
    if (e.owner?.id && ObjectId.isValid(e.owner.id)) {
      updated.ownerId = new ObjectId(e.owner.id);
    } else {
      // if owner.id is missing or invalid, keep null (will need manual fix)
      updated.ownerId = null;
      console.log(`  WARNING: event ${e._id} has no valid owner.id: "${e.owner?.id}"`);
    }

    // replace the document: remove old nested fields, set new flat fields
    await db.collection("events").updateOne(
      { _id: e._id },
      {
        $set: updated,
        $unset: { event: "", owner: "" }, // remove old nested fields
      }
    );
    eventMigrated++;
  }
  console.log(`  Migrated ${eventMigrated} events`);

  // migrate savedEvents collection
  console.log(">> Migrating savedEvents...");
  const savedEvents = await db.collection("savedEvents").find({}).toArray();
  let savedMigrated = 0;

  for (const s of savedEvents) {
    const updates = {};

    // convert userId string to ObjectId
    if (typeof s.userId === "string" && ObjectId.isValid(s.userId)) {
      updates.userId = new ObjectId(s.userId);
    }

    // convert eventId string to ObjectId
    if (typeof s.eventId === "string" && ObjectId.isValid(s.eventId)) {
      updates.eventId = new ObjectId(s.eventId);
    }

    // convert savedAt string to Date if needed
    if (typeof s.savedAt === "string") {
      updates.savedAt = new Date(s.savedAt);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("savedEvents").updateOne(
        { _id: s._id },
        { $set: updates }
      );
      savedMigrated++;
    }
  }
  console.log(`  Migrated ${savedMigrated} savedEvents`);

  // migrate notifications collection
  console.log(">> Migrating notifications...");
  const hasNotifications =
    (await db.listCollections({ name: "notifications" }).toArray()).length > 0;

  if (hasNotifications) {
    const notifications = await db.collection("notifications").find({}).toArray();
    let notifMigrated = 0;

    for (const n of notifications) {
      const updates = {};

      // convert userId string to ObjectId
      if (typeof n.userId === "string" && ObjectId.isValid(n.userId)) {
        updates.userId = new ObjectId(n.userId);
      }

      // rename read -> isRead to match new schema
      if (n.read !== undefined && n.isRead === undefined) {
        updates.isRead = n.read;
        await db.collection("notifications").updateOne(
          { _id: n._id },
          { $unset: { read: "" } }
        );
      }

      if (Object.keys(updates).length > 0) {
        await db.collection("notifications").updateOne(
          { _id: n._id },
          { $set: updates }
        );
        notifMigrated++;
      }
    }
    console.log(`  Migrated ${notifMigrated} notifications`);
  } else {
    console.log("  No notifications collection found, skipping");
  }

  console.log(">> Migration complete!");
  await client.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
