const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const checkAdmin = require("../middleware/checkAdmin");

const getAllUsers = require("../controllers/users/getAllUsers");
const getUserById = require("../controllers/users/getUserById");
const deleteUser = require("../controllers/users/deleteUser");
const updateAvatar = require("../controllers/users/updateAvatar");
const updateUser = require("../controllers/users/updateUser");
const updateNotificationSettings = require("../controllers/users/updateNotificationSettings");
const searchUsers = require("../controllers/users/searchUsers");

router.get("/", getAllUsers);
router.get("/search", searchUsers);
router.get("/:id", getUserById);
router.delete("/:id", checkAdmin, deleteUser);
router.patch("/:id/avatar", upload.single("avatar"), updateAvatar);
router.patch("/:id/notifications", updateNotificationSettings);
router.patch("/:id", updateUser);

module.exports = router;
