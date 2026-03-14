const express = require("express");
const app = express();
const port = 3001;

// form sends data in as JSON string, use express.json()
app.use(express.json());

// cross origin reseources sharing middleware to allow req from react
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // we allow our react-ap on 5173 to communicate
  res.setHeader("Access-Control-Allow-Methods", "GET", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.listen(port, function () {
  console.log("Server is running on http://localhost: " + port);
});
