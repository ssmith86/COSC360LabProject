const express = require("express");
const router = express.Router();
const { getDB } = require("./db");
const { ObjectId } = require("mongodb");

// add a multer to handle new image upload when edit events
const multer = require("multer");
const path = require("path");

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

// Add a get method to fetch event by its id
router.get("/:eventId", async function (req, res) {
  const eventId = req.params.eventId;

  try {
    const db = getDB();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ message: "Event not found in database." });
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// handles update on events (update with multer)
router.put("/:eventId", upload.single("image"), async function (req, res) {
  const eventId = req.params.eventId;
  // const updatedData = req.body;
  const body = req.body;

  // if (!updatedData || Object.keys(updatedData).length === 0) {
  //   return res.status(400).json({ message: "No update data provided." });
  // }

  // try {
  //   const db = getDB();
  //   const result = await db
  //     .collection("events")
  //     .updateOne({ _id: new ObjectId(eventId) }, { $set: updatedData });

  //   if (result.matchedCount === 0) {
  //     return res.status(404).json({ message: "Event not found." });
  //   }

  //   res.status(200).json({ message: "Event updated successfully." });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ message: "No update data provided by user" });
  }

  // build the updateData
  const updatedData = {
    "event.name": body["event.name"],
    "event.start_date": body["event.start_date"],
    "event.end_date": body["event.end_date"],
    "event.location.address": body["event.location.address"],
    "event.location.street": body["event.location.street"],
    "event.location.city": body["event.location.city"],
    "event.location.province": body["event.location.province"],
    "event.location.country": body["event.location.country"],
    description: body.description,
  };
  // we only update image if the user uploads a new image file
  if (req.file) {
    updatedData["event.image"] = `/uploads/${req.file.filename}`;
  }

  // run the database update
  try {
    const db = getDB();
    const result = await db
      .collection("events")
      .updateOne({ _id: new ObjectId(eventId) }, { $set: updatedData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// handle delete on events
router.delete("/:eventId", async function (req, res) {
  const eventId = req.params.eventId;

  try {
    const db = getDB();
    const result = await db
      .collection("events")
      .deleteOne({ _id: new ObjectId(eventId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
