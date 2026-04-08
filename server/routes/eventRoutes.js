const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const checkBanned = require("../middleware/checkBanned");

const createEvent = require("../controllers/events/createEvent");
const getUpcomingEvents = require("../controllers/events/getUpcomingEvents");
const getMyEvents = require("../controllers/events/getMyEvents");
const getEventById = require("../controllers/events/getEventById");
const updateEvent = require("../controllers/events/updateEvent");
const patchEventStatus = require("../controllers/events/patchEventStatus");
const deleteEvent = require("../controllers/events/deleteEvent");

router.get("/upcoming", getUpcomingEvents);
router.get("/myevents", getMyEvents);
router.get("/:eventId", getEventById);
router.post("/", checkBanned, upload.single("image"), createEvent);
router.put("/:eventId", checkBanned, upload.single("image"), updateEvent);
router.patch("/:eventId", checkBanned, patchEventStatus);
router.delete("/:eventId", deleteEvent);

module.exports = router;
