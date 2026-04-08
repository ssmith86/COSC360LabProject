const express = require("express");
const router = express.Router();

const getNotifications = require("../controllers/notifications/getNotifications");
const markAllRead = require("../controllers/notifications/markAllRead");
const markOneRead = require("../controllers/notifications/markOneRead");

router.get("/", getNotifications);
router.patch("/read-all", markAllRead); // must be before /:id
router.patch("/:id", markOneRead);

module.exports = router;
