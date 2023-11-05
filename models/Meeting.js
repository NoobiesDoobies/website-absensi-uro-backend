const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const meetingSchema = new mongoose.Schema({
  title: {
    type: [String],
    enum: ["Bersih-bersih", "Ngoprek", "Progres report", "Ideation"],
    default: "Ngoprek",
  },
  date: { type: Date, required: true, unique: true },
  createdAt: { type: Date, default: new Date(), ref: "User" },
  division: {
    type: [String],
    enum: ["Kontrol", "Mekanik"],
    required: true,
  }
});

meetingSchema.plugin(uniqueValidator);

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
