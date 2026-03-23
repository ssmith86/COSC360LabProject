// Create the db.js to use MongoClient
const { MongoClient } = require("mongodb");

require("dotenv").config();

// create the db instance
let db;

async function connectDB() {
  // create new MongoClient using the .env file's MONGO_URI, which
  // connects to the MONGO ATLAS cloud we set up
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  // the client db is named on atlas cloud as cosc360db under Cluster 0
  db = client.db("cosc360db");
  console.log(">> MongoDB connection successful");
}

// create a get db function
function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
