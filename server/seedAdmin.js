const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "cosc360db",
  });

  const result = await User.updateOne(
    { email: "email@email.com" },
    { $set: { isAdmin: true } }
  );

  if (result.matchedCount === 0) {
    console.log("No user found with that email.");
  } else {
    console.log("Admin set successfully!");
  }

  await mongoose.connection.close();
}

seedAdmin().catch(console.error);
