const express = require("express");
const router = express.Router();
const checkBanned = require("../middleware/checkBanned");

const getSavedEvents = require("../controllers/savedEvents/getSavedEvents");
const saveEvent = require("../controllers/savedEvents/saveEvent");
const unsaveEvent = require("../controllers/savedEvents/unsaveEvent");

router.get("/", getSavedEvents);
router.post("/", checkBanned, saveEvent);
router.delete("/", checkBanned, unsaveEvent);

module.exports = router;
