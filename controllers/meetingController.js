const Meeting = require("../models/Meeting");
const MeetingScheduler = require("../models/MeetingScheduler");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");

const getMeetings = async (req, res, next) => {
  let meetings;
  try {
    meetings = await Meeting.find().exec();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({
    meetings: meetings.map((meeting) => meeting.toObject({ getters: true })),
  });
};

const createMeeting = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are validation errors
    console.log(req.body);
    return res.status(422).json({ errors: errors.array() });
  }

  const { title, date, createdBy } = req.body;

  const createdMeeting = new Meeting({
    title,
    date,
    createdBy,
  });

  // add await to catch any error inside the async operations
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdMeeting.save({ session: sess });
    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Meeting created successfully!", data: createdMeeting });
};

const getMeetingById = async (req, res, next) => {
  const id = req.params.mid;

  let meeting;
  try {
    meeting = await Meeting.findById(id);
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!meeting) {
    const error = new HttpError("Meeting not found", 404);
    return next(error);
  }

  res.status(200).json({ meeting: meeting.toObject({ getters: true }) });
};

const updateMeetingById = async (req, res, next) => {
  const id = req.params.mid;
  const { title, date, createdBy } = req.body;

  let creator;
  // Find the user who created the meeting
  try {
    creator = await User.findById(createdBy);
  } catch (err) {
    const error = new HttpError("User not found", 404);
    return next(error);
  }
  // If no user with userId found
  if (!creator) {
    const error = new HttpError("User not found", 404);
    return next(error);
  }

  // If user doesn't have admin role, return error
  if (creator.role !== "admin") {
    const error = new HttpError(
      "You are not authorized to create a meeting",
      401
    );
    return next(error);
  }

  let meeting;
  try {
    meeting = await Meeting.findById(id);
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!meeting) {
    const error = new HttpError("Meeting not found", 404);
    return next(error);
  }

  // update meeting
  meeting.title = title;
  meeting.date = date;

  try {
    await meeting.save();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({ message: "Meeting updated!", data: meeting });
};

const deleteMeetingById = async (req, res, next) => {
  const id = req.params.mid;

  let meeting;
  try {
    meeting = await Meeting.findById(id).populate("attendees");
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!meeting) {
    const error = new HttpError("Meeting not found", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    if (meeting.attendees) {
      const userPromises = meeting.attendees.map(async (attendeeId) => {
        // Find the user by ID and remove the meeting ID from their 'meetingsAttended' array
        const user = await User.findById(attendeeId);
        if (user) {
          user.meetingsAttended.pull(meeting.id);
          return user.save({ session: sess });
        }
      });

      // Wait for all user updates to complete
      await Promise.all(userPromises);
    }

    await Meeting.deleteOne({ _id: meeting.id }).session(sess);

    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({ message: "Meeting deleted!" });
};

const scheduleMeeting = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are validation errors
    console.log(req.body);
    return res.status(422).json({ errors: errors.array() });
  }

  const { division, day, hour, minute, userId, isJustOnce, dateEnd } = req.body;

  const createdMeetingScheduler = new MeetingScheduler({
    division,
    day,
    hour,
    minute,
    createdBy: userId,
    isJustOnce,
    dateEnd,
  });

  // add await to catch any error inside the async operations
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdMeetingScheduler.save({ session: sess });
    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }
  res
    .status(200)
    .json({ message: "Meeting scheduler created successfully!", data: createdMeetingScheduler });
};

exports.getMeetings = getMeetings;
exports.createMeeting = createMeeting;
exports.getMeetingById = getMeetingById;
exports.updateMeetingById = updateMeetingById;
exports.deleteMeetingById = deleteMeetingById;
exports.scheduleMeeting = scheduleMeeting;
