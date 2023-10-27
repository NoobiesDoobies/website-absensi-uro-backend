const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");

router.patch("/attend/:uid", userController.attendMeeting);

module.exports = router;