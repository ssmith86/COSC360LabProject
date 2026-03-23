// to seed the SampleData.json into the database cosc360db MongoDB
const { MongoClient } = require("mongodb");
require("dotenv").config();
// get the pseudo data in SampleData.json
const sampleData = require("./SampleData.json");

// implement the seed method
async function seed() {
  // client is instantiated using the env.MONGO_URI Mongo Atlas Cloud connection string
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  // get the Cluster 0 cosc360db table
  const db = client.db("cosc360db");

  // to seed the pseudo data, first delete all existing ones in events collection
  await db.collection("events").deleteMany({});
  // insert the data in SampleData.json into the events collection
  await db.collection("events").insertMany(sampleData);
  // console log to user
  console.log(">>> Sample data seeded successfully!");

  await client.close();
}

seed().catch(console.error);
