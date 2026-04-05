const mongoose = require("mongoose");

require("dotenv").config();

// connect to mongoDB using mongoose
// the MONGO_URI is stored in .env file
async function connectDB() {
  // connect to cosc360db we set
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "cosc360db",
  });
  console.log(">> MongoDB connection successful");
}

module.exports = { connectDB };
