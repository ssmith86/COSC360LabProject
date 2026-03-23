const express = require("express");

// connect to MongoDB using functionality in db.js file
const { connectDB } = require("./db");
require("dotenv").config();

const app = express();
const port = 3001;

const handleEventCreationForm = require("./handleEventCreationForm");
const handleRegister = require("./handleRegister");
const handleSearch = require("./handleSearch");

// cross origin reseources sharing middleware to allow req from react
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // we allow our react-ap on 5173 to communicate
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// add use json to parse incoming JSON Request
app.use(express.json());

// routes used by the app
app.use("/api/createEventsForm", handleEventCreationForm);
app.use("/search", handleSearch);
app.use("/api/register", handleRegister);

// Connect to MongoDB and start
connectDB()
  .then(() => {
    app.listen(port, () =>
      console.log(`Server is running on http://localhost:${port}`),
    );
  })
  .catch((err) => {
    console.error("Failed to connect MongoDB DB cosc360db: ", err);
    process.exit(1);
  });
