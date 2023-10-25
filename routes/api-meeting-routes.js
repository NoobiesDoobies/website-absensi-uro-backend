const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");

router.get('/', meetingController.getMeetings);
router.post('/', meetingController.createMeeting);
// router.get('/:id', meetingController.getUserById);

module.exports = router;