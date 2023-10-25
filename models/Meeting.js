const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  title: {
    type: [String],
    default: ["Ngoprek"],
    enum: ["Bersih-bersih", "Ngoprek", "Progres report", "Ideation"],
  },
  date: { type: Date, required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: new Date(), ref: "User" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
