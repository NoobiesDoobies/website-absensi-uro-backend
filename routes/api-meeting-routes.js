const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const checkIsAdmin = require("../middleware/check-isAdmin");
const meetingPostScheduler = require("../middleware/meeting-post-scheduler");

router.get("/meeting/:mid", meetingController.getMeetingById);

router.get("/", meetingController.getMeetings);

router.use(
  checkIsAdmin
);

router.get("/schedules", meetingController.getMeetingsSchedule);

router.post(
  "/",
  [check("title").not().isEmpty(), check("date").not().isEmpty()],
  meetingController.createMeeting
);


router.post(
  "/schedule",
  meetingController.scheduleMeeting, 
  meetingPostScheduler
)

router.patch(
  "/:mid",
  [check("title").not().isEmpty(), check("date").not().isEmpty()],
  meetingController.updateMeetingById
);

router.delete("/:mid", meetingController.deleteMeetingById);

module.exports = router;
