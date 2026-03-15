const express = require("express");
const app = express();
const port = 3001;

const handleEventCreationForm = require("./handleEventCreationForm");

// cross origin reseources sharing middleware to allow req from react
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // we allow our react-ap on 5173 to communicate
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// route event creation form (when submit)
app.use("/api/createEventsForm", handleEventCreationForm);

// search route
const sampleData = require('./SampleData.json');

app.get('/search', (req, res) => {
  const searchTerm = req.query.q?.toLowerCase() || "";

  const results = sampleData.filter(item =>
    item.event.name.toLowerCase().includes(searchTerm) ||
    item.owner.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm) ||

    item.event.location.country.toLowerCase().includes(searchTerm) ||
    item.event.location.province.toLowerCase().includes(searchTerm) ||
    item.event.location.city.toLowerCase().includes(searchTerm) ||
    item.event.location.street.toLowerCase().includes(searchTerm) ||
    item.event.location.address.toString().includes(searchTerm) ||
    
    item.event.start_date.toLowerCase().includes(searchTerm)
  );

  res.json(results);
});

app.listen(port, function () {
  console.log("Server is running on http://localhost: " + port);
});
