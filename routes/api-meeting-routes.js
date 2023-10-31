const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const {checkIsAdmin} = require("../middleware/check-isAdmin");

router.get("/:mid", meetingController.getMeetingById);

router.get("/", meetingController.getMeetings);

router.use(
  checkIsAdmin
);

router.post(
  "/",
  [check("title").not().isEmpty(), check("date").not().isEmpty()],
  meetingController.createMeeting
);

router.patch(
  "/:mid",
  [check("title").not().isEmpty(), check("date").not().isEmpty()],
  meetingController.updateMeetingById
);

router.delete("/:mid", meetingController.deleteMeetingById);

module.exports = router;
