const express = require("express");
const router = express.Router();
const Event = require("./models/Event");

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
  try {
    const event = await Event.findById(req.params.eventId);

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
    title: body.title,
    startDate: body.startDate,
    endDate: body.endDate,
    "location.address": body["location.address"],
    "location.street": body["location.street"],
    "location.city": body["location.city"],
    "location.province": body["location.province"],
    "location.country": body["location.country"],
    category: body.category,
    description: body.description,
    updatedAt: new Date(),
  };
  // we only update image if the user uploads a new image file
  if (req.file) {
    updatedData.imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $set: updatedData },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// handle status update (cancel/uncancel) on events
router.patch("/:eventId", async function (req, res) {
  const { status } = req.body;
  const newStatus = status || "published";

  try {
    const updates = { status: newStatus };
    // set publishedAt when status changes to published
    if (newStatus === "published") {
      updates.publishedAt = new Date();
    }

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $set: updates },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event status updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// handle delete on events
router.delete("/:eventId", async function (req, res) {
  try {
    const event = await Event.findByIdAndDelete(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
