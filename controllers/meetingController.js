const Meeting = require("../models/Meeting");
const HttpError = require("../models/http-error");

const getMeetings = (req, res, next) => {};

const createMeeting = async (req, res, next) => {
  const createdMeeting = new Meeting({
    name: req.body.name,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
    description: req.body.description,
    attendees: req.body.attendees,
    creator: req.body.creator,
  });

  // add await to catch any error inside the async operations
  try {
    await createdMeeting.save();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Meeting created successfully!", data: createdMeeting });
};

exports.getMeetings = getMeetings;
exports.createMeeting = createMeeting;
