const express = require("express");
// create the post route handler to handle incoming data creation from the event creation form
const router = express.Router();

router.post("/", function (req, res) {
  const eventData = req.body; // the json file of event data

  // check whether data is empty or missing event or name
  if (!eventData || !eventData.event || !eventData.event.name) {
    // if invalid data, send 400 status with invalid message
    res.status(400).json({ message: "Invalid event data received." });
    return;
  }

  // NOTE: we do not have DB so we need to hardcode for now, all owners are the same
  const newEventData = {
    owner: {
      name: "Sam Smith",
      id: "123456",
    },
    event: eventData.event,
    description: eventData.description,
  };

  console.log("New data event received: ", newEventData);

  res.status(200).json({ message: "Event creation successful." });
});

module.exports = router;
