const express = require("express");
// add multer for image upload
const path = require("path");

// connect to MongoDB using functionality in db.js file
const { connectDB } = require("./db");
require("dotenv").config();
const checkBanned = require("./checkBanned");

const app = express();
// const port = 3001;
const port = process.env.PORT || 3001;

const handleEventCreationForm = require("./handleEventCreationForm");
const handleRegister = require("./handleRegister");
const handleSearch = require("./handleSearch");
const handleMyEvents = require("./handleMyEvents");
const handleSavedEvents = require("./handleSavedEvents");
const handleLogin = require("./handleLogin");
const handleUsers = require("./handleUsers");

const handleEventActions = require("./handleEventActions");
const handleAnalytics = require("./handleAnalytics");
const handleNotifications = require("./handleNotifications");
const handleComments = require("./handleComments");

// cross origin reseources sharing middleware to allow req from react
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // we allow our react-ap on 5173 to communicate
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// add use json to parse incoming JSON Request
app.use(express.json());
// handle image upload with multer
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes used by the app
app.use("/api/createEventsForm", checkBanned, handleEventCreationForm);
app.use("/search", handleSearch);
app.use("/api/register", handleRegister);
app.use("/api/events", handleMyEvents);
app.use(
  "/api/savedevents",
  (req, res, next) => {
    if (req.method === "GET") return next();
    return checkBanned(req, res, next);
  },
  handleSavedEvents,
);
app.use("/api/login", handleLogin);
app.use("/api/users", handleUsers);
app.use("/api/events", checkBanned, handleEventActions);
app.use("/api/analytics", handleAnalytics);
app.use("/api/notifications", handleNotifications);
app.use(
  "/api/comments",
  (req, res, next) => {
    if (req.method === "GET") return next();
    return checkBanned(req, res, next);
  },
  handleComments,
);

// Connect to MongoDB and start
// connectDB()
//   .then(() => {
//     app.listen(port, () =>
//       console.log(`Server is running on http://localhost:${port}`),
//     );
//   })
//   .catch((err) => {
//     console.error("Failed to connect MongoDB DB cosc360db: ", err);
//     process.exit(1);
//   });

// make connection suitable for testing
// connect to MongoDB and start
if (require.main === module) {
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
}

module.exports = app;
