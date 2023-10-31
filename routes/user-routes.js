const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const checkAuth = require("../middleware/check-auth");

router.use(checkAuth);
router.patch("/attend", userController.attendMeeting);

module.exports = router;
