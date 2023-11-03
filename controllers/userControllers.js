const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Meeting = require("../models/Meeting");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `Invalid inputs passed, please check your data. Possible error: ${errors.message}`,
        422
      )
    );
  }

  const { name, email, password, position, generation, role } = req.body;

  // Find a user with matching email
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      `Signing up failed, please try again later`,
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exists, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    position,
    generation,
    role,
  });

  console.log(createdUser);

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser._id,
        email: createdUser.email,
        isAdmin: createdUser.role === "admin",
      },
      "KEY_SECRET",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(`Sign up failed, please try again later`, 500);
    return next(error);
  }

  res.status(201).json({
    message: "User created!",
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
    isAdmin: createdUser.role === "admin",
  });
};

const getMeetingsAttendedByUserId = async (req, res, next) => {
  const id = req.userData.id;

  let userWithMeetings;
  try {
    userWithMeetings = await User.findById(id).populate("meetings");
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!userWithMeetings) {
    const error = new HttpError("User not found", 404);
    return next(error);
  }

  meetingsAttended = userWithMeetings.meetings;

  res.status(200).json({
    meetingsAttended: meetingsAttended.map((meeting) =>
      meeting.toObject({ getters: true })
    ),
  });
};

const getUserById = async (req, res, next) => {
  const id = req.params.uid;
  let user;

  // Try to fetch user by id
  try {
    user = await User.findOne({ _id: id }, "-password");
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  // If user not found
  if (!user) {
    const error = new HttpError("User not found", 404);
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const updateUserById = async (req, res, next) => {
  const id = req.userData.id;
  const { name, email, position, generation } = req.body;
  // check email already exists
  let sameEmailUser;
  try {
    sameEmailUser = await User.findOne({ email: email }, "-password");
  } catch (err) {
    console.log(sameEmailUser);
    console.log(err.message);
    const error = new HttpError(
      "Could not update profile, please try again.",
      500
    );
    return next(error);
  }

  if (sameEmailUser) {
    if (sameEmailUser._id.toString() !== id.toString()) {
      const error = new HttpError("Email already exists", 422);
      return next(error);
    }
  }

  const filter = { _id: id };
  const update = {
    name,
    email,
    position,
    generation,
  };

  if (req.file) {
    update.image = req.file.path;
    console.log(req.file.path);
  }

  let user;
  try {
    user = await User.findOneAndUpdate(filter, update, { new: true });
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, comfirmNewPassword } = req.body;
  const id = req.userData.id;

  if(newPassword !== comfirmNewPassword){
    return next(
      new HttpError("New password and comfirm password does not match", 422)
    );
  }

  let user;
  try {
    user = await User.findOne({ _id: id });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(oldPassword, user.password);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  let hashedNewPassword;

  try {
    hashedNewPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    new HttpError("Something went wrong, please try again later", 500);
  }

  user.password = hashedNewPassword;

  try {
    await user.save();
  } catch (err) {
    new HttpError("Something went wrong, please try again later", 500);
  }

  res.status(200).send({
    message: "Password updated sucessfully",
  });
};

const deleteUserById = async (req, res, next) => {
  const id = req.userData.id;
  let user;
  try {
    user = await User.findOne({ _id: id }, "-password").populate(
      "meetingsAttended"
    );
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found", 404);
    return next(error);
  }

  try {
    await user.remove();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({ message: "User deleted" });
};

const attendMeeting = async (req, res, next) => {
  const id = req.userData.id;

  let user;
  try {
    user = await User.findOne({ _id: id }, "-password");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found", 404);
    return next(error);
  }

  // Finding latest meeting
  let meeting;
  try {
    meeting = await Meeting.findOne({})
      .sort({ field: "asc", date: -1 })
      .limit(1);
  } catch (err) {
    const error = new HttpError("Meeting not found", 500);
    return next(error);
  }

  if (!meeting) {
    const error = new HttpError("Meeting not found", 404);
    return next(error);
  }

  if (meeting.attendees.includes(user.id)) {
    const error = new HttpError("User already attended this meeting", 422);
    console.log("User already attended");
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    meeting.attendees.push(user);
    user.meetingsAttended.push(meeting);
    await meeting.save({ session: sess });
    await user.save({ session: sess });
    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "User attended meeting" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Find a user with matching email
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(`Login in failed, please try again later`, 500);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(`Login in failed, please try again later`, 500);
    return next(error);
  }

  if (!existingUser || !isValidPassword) {
    const err = new HttpError("Invalid credentials, could not log you in", 401);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        isAdmin: existingUser.role === "admin",
      },
      "KEY_SECRET",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(`Login in failed, please try again later`, 500);
    return next(error);
  }

  console.log("logged in");

  res.status(201).json({
    message: "Logged In!",
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    isAdmin: existingUser.role === "admin",
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.getUserById = getUserById;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
exports.getMeetingsAttendedByUserId = getMeetingsAttendedByUserId;
exports.attendMeeting = attendMeeting;
exports.login = login;
exports.updatePassword = updatePassword;
