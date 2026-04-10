const express = require("express");
const router = express.Router();
const checkBanned = require("../middleware/checkBanned");

const getComments = require("../controllers/comments/getComments");
const getUserComments = require("../controllers/comments/getUserComments");
const postComment = require("../controllers/comments/postComment");
const deleteComment = require("../controllers/comments/deleteComment");

router.get("/user/:userId", getUserComments);
router.get("/:eventId", getComments);
router.post("/", checkBanned, postComment);
router.delete("/:commentId", checkBanned, deleteComment);

module.exports = router;
