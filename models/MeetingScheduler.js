const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const meetingSchedulerSchema = new mongoose.Schema({
  division: {
    type: [String],
    enum: ["Kontrol", "Mekanik"],
    required: true,
  },
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  hour: {
    type: Number,
    required: true,
  },
  minute: {
    type: Number,
    required: true,
  },
  isJustOnce: {
    type: Boolean,
    required: true,
  },
  dateEnd: {
    type: Date,
  },
  createdAt: { type: Date, default: new Date(), ref: "User" },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
});

meetingSchedulerSchema.plugin(uniqueValidator);

const MeetingScheduler = mongoose.model(
  "MeetingScheduler",
  meetingSchedulerSchema
);

module.exports = MeetingScheduler;
