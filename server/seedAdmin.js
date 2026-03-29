const { MongoClient } = require("mongodb");
require("dotenv").config();

async function seedAdmin() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("cosc360db");

  const result = await db.collection("users").updateOne(
    { email: "email@email.com" },
    { $set: { isAdmin: true } }
  );

  if (result.matchedCount === 0) {
    console.log("No user found with that email.");
  } else {
    console.log("Admin set successfully!");
  }

  await client.close();
}

seedAdmin().catch(console.error);
