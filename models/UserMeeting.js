const mongoose = require("mongoose");

const userMeetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
  lateTime: { type: Number, default: 0 },
});

const UserMeeting = mongoose.model("UserMeeting", userMeetingSchema);

module.exports = UserMeeting;