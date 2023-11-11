const Meeting = require("../models/Meeting");
const MeetingScheduler = require("../models/MeetingScheduler");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const UserMeeting = require("../models/UserMeeting");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const CronJobManager = require("cron-job-manager");
const manager = new CronJobManager();

const convertToCronSchedule = (day, hour, minute) => {
  // Mapping of days to cron values (Sunday is 0, Monday is 1, etc.)
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const cronDay = dayMap[day]; // Convert the day string to a cron value
  const cronHour = hour.toString();
  const cronMinute = minute.toString();

  // Validate the input
  if (
    cronDay !== undefined && // Check if the hour is an integer
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 // Check if the minute is in the valid range (0-59)
  ) {
    // Create the cron schedule
    const cronSchedule = `${cronMinute} ${cronHour} * * ${cronDay}`;

    return cronSchedule;
  } else {
    // If the input is invalid, return null or an error message
    return null;
  }
};

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const getMeetings = async (req, res, next) => {
  console.log("getting meetings");
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
    meeting = await Meeting.findById(id);
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

    await Meeting.deleteOne({ _id: meeting.id }).session(sess);
    await UserMeeting.deleteMany({ meeting: meeting.id }).session(sess);
    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({ message: "Meeting deleted!" });
};

const getMeetingsSchedule = async (req, res, next) => {
  let meetings;

  console.log("getting schedules");

  try {
    meetings = await MeetingScheduler.find().exec();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res.status(200).json({
    meetings: meetings.map((meeting) => meeting.toObject({ getters: true })),
  });
};

const scheduleMeeting = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are validation errors
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

  const scheduleId = createdMeetingScheduler.toObject({ getters: true }).id;

  const scheduleOption = {
    start: false,
    timeZone: "Asia/Jakarta",
    onComplete: ()=>{console.log("cron job completed")},
  }

  // manager.add(scheduleId, convertToCronSchedule(day, hour - 1, minute), () => {
  manager.add(scheduleId, "* * * * * *", () => {  
    console.log("cron job running");
    const meeting = new Meeting({
      title: `Ngoprek`,
      division: division,
      date: new Date().addHours(1),
      createdBy: userId,
    });

    // add await to catch any error inside the async operations
    try {
      meeting.save();
    } catch (err) {
      const error = new HttpError(err.message, 500);
      return next(error);
    }
  });
  manager.start(scheduleId);

  res.status(200).json({ message: "Meeting scheduled successfully!" });
};

const deleteSchedule = async (req, res, next) => {
  const id = req.params.sid;

  let scheduleToDelete;
  try {
    scheduleToDelete = await MeetingScheduler.findById(id);
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!scheduleToDelete) {
    const error = new HttpError("Schedule not found", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await MeetingScheduler.deleteOne({ _id: scheduleToDelete.id }).session(
      sess
    );

    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  console.log("stopping schedule with id: ", id)
  manager.stop(id);

  res.status(200).json({ message: "Schedule deleted!" });
};

exports.getMeetings = getMeetings;
exports.createMeeting = createMeeting;
exports.getMeetingById = getMeetingById;
exports.updateMeetingById = updateMeetingById;
exports.deleteMeetingById = deleteMeetingById;
exports.scheduleMeeting = scheduleMeeting;
exports.getMeetingsSchedule = getMeetingsSchedule;
exports.deleteSchedule = deleteSchedule;