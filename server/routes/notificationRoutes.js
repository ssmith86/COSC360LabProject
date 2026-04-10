const express = require("express");
const router = express.Router();

const getNotifications = require("../controllers/notifications/getNotifications");
const markAllRead = require("../controllers/notifications/markAllRead");
const markOneRead = require("../controllers/notifications/markOneRead");
const deleteOneNotification = require("../controllers/notifications/deleteOneNotification");

router.get("/", getNotifications);
router.patch("/read-all", markAllRead); // must be before /:id
router.patch("/:id", markOneRead);
router.delete("/:id", deleteOneNotification);

module.exports = router;
