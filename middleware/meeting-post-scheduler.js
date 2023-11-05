const cron = require("node-cron");
const HttpError = require("../models/http-error");

const Meeting = require("../models/Meeting");

let scheduledTasks = {};

function convertToCronSchedule(day, hour, minute) {
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
}

module.exports = async (req, res, next) => {
  const { division, day, hour, minute, userId } = req.body;
  let { dateEnd, isJustOnce } = req.body;
  isJustOnce = isJustOnce === "true" ? true : false;
  dateEnd = new Date(dateEnd);
 

  if (!isJustOnce) {
    const schedule = convertToCronSchedule(day, hour, minute);
    const task = cron.schedule(schedule, async () => {
        console.log("every second")
      try {

        // post request to /api/meetings/
        const newMeeting = new Meeting({
          division,
          date: new Date(),
        });

        await newMeeting.save();
      } catch (err) {
        console.log(err);
        const error = new HttpError(err.message, 500);
        return next(error);
      }
    });

    scheduledTasks[req.body.createdMeetingScheduler._id] = task;

    const currentDate = new Date();
    setTimeout(() => {
      console.log("timeout")
      task.stop()
    }, dateEnd - currentDate)
  } else {
    const schedule = convertToCronSchedule(day, hour, minute);
    // const task = cron.schedule(schedule, async () => {
    const task = cron.schedule("* * * * * *", async () => {
      try {
        console.log("creating meeting")
        // post request to /api/meetings/
        const newMeeting = new Meeting({
          division,
          date: new Date(),
        });
        await newMeeting.save();
        
      } catch (err) {
        console.log(err);
        const error = new HttpError(err.message, 500);
        return next(error);
      }
      task.stop()
    });



  }


  res.status(200).json({
    message: "Meeting scheduled successfully!",
    data: req.body.createdMeetingScheduler,
  });
};
