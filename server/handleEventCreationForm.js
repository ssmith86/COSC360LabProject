const express = require("express");
// create the post route handler to handle incoming data creation from the event creation form
const router = express.Router();
// use Event model from mongoose
const Event = require("./models/Event");

// add multer to handle event image upload
const multer = require("multer");
const path = require("path");

// image storage using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

// update router with multer image upload handling
router.post("/", upload.single("image"), async function (req, res) {
  const eventData = req.body; // the json file of event data

  // check whether data is empty or missing event or name
  if (!eventData || !eventData.event_name) {
    // if invalid data, send 400 status with invalid message
    res.status(400).json({ message: "Invalid event data received." });
    return;
  }

  try {
    // add imagePath
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    // create event using mongoose Event model (flat structure)
    const newEvent = await Event.create({
      title: eventData.event_name,
      description: eventData.description,
      category: eventData.category,
      ownerId: eventData.userId,
      imageUrl: imagePath,
      startDate: eventData.start_date,
      endDate: eventData.end_date,
      location: {
        address: eventData.address,
        street: eventData.street,
        city: eventData.city,
        province: eventData.province,
        country: eventData.country,
      },
    });

    console.log("New data event received: ", newEvent);

    res.status(200).json({ message: "Event creation successful." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
