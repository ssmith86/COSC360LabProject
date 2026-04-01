const express = require("express");
// create the post route handler to handle incoming data creation from the event creation form
const router = express.Router();
// get MongoDb
const { getDB } = require("./db");

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
    // updated with multer image upload
    const db = getDB();
    // add imagePath
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newEvent = {
      // owner: {
      //   name: "Sam Smith",
      //   id: "123456",
      // },
      owner: {
        name: eventData.owner_name || "Unknown",
        id: eventData.userId || "",
      },
      // update event with imagePath
      event: {
        name: eventData.event_name,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        image: imagePath,
        location: {
          address: eventData.address,
          street: eventData.street,
          city: eventData.city,
          province: eventData.province,
          country: eventData.country,
        },
      },
      description: eventData.description,
    };

    // add to db collection events in cosc360db in Cluster 0
    // await db.collection("events").insertOne(newEvent);
    // console.log("New data event received: ", newEvent);
    const result = await db.collection("events").insertOne(newEvent);

    // automatically save the event for the owner in savedEvents collection
    await db.collection("savedEvents").insertOne({
      userId: eventData.userId,
      eventId: result.insertedId.toString(),
      savedAt: new Date(),
    });

    console.log("New data event received: ", newEvent);

    res.status(200).json({ message: "Event creation successful." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
