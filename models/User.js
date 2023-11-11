const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
      "Manpro R1",
      "Manpro R2",
      "Kepala Divisi Mekanik",
      "Kepala Divisi Kontrol",
      "Kru Mekanik",
      "Kru Kontrol",
      "Official",
    ],
  },
  division: {
    type: String,
    required: true,
    enum: ["Kontrol", "Mekanik", "Official"],
  },
  generation: { type: Number, required: true },
  image: { type: String, default: "uploads/images/default.jpg" },
  dateOfBirth: { type: Date, required: true },
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;
