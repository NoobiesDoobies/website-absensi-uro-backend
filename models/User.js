const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: 8 },
  createdAt: { type: Date, default: new Date() },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  position: {
    type: String,
    required: true,
    enum: [
      "Ketua",
      "Wakil Ketua",
      "Kepala Divisi Mekanik",
      "Kepala Divisi Kontrol",
      "Kru Mekanik",
      "Kru Kontrol",
      "Official",
    ],
  },
  generation: { type: Number, required: true },
  meetingAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
