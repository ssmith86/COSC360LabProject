const { connectDB } = require("../db");
const mongoose = require("mongoose");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
});
