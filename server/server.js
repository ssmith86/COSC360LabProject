const express = require("express");
const app = express();
const port = 3001;

const handleEventCreationForm = require("./handleEventCreationForm");

// cross origin reseources sharing middleware to allow req from react
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // we allow our react-ap on 5173 to communicate
  res.setHeader("Access-Control-Allow-Methods", "GET", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// route event creation form (when submit)
app.use("/api/createEventsForm", handleEventCreationForm);

app.listen(port, function () {
  console.log("Server is running on http://localhost: " + port);
});
