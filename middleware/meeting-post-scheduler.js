const cron = require("node-cron");
const CronJobManager = require("cron-job-manager");
const HttpError = require("../models/http-error");

const Meeting = require("../models/Meeting");

const manager = new CronJobManager();

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

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

module.exports = async (req, res, next) => {
  const { division, day, hour, minute } = req.body;

  let { dateEnd, isJustOnce } = req.body;
  isJustOnce = isJustOnce === "true" ? true : false;
  dateEnd = new Date(dateEnd);

  if (!isJustOnce) {
    const schedule = convertToCronSchedule(day, hour - 1, minute);
    manager.add("req")
    const task = cron.schedule(schedule, async () => {
      console.log("every second");
      try {
        // post request to /api/meetings/
        const newMeeting = new Meeting({
          division,
          date: new Date().addHours(1),
        });

        await newMeeting.save();
      } catch (err) {
        console.log(err);
        const error = new HttpError(err.message, 500);
        return next(error);
      }
    });

    const currentDate = new Date();
    setTimeout(() => {
      console.log("timeout");
      task.stop();
    }, dateEnd - currentDate);
    console.log(JSON.stringify(task, null, 2));
  } else {
    const schedule = convertToCronSchedule(day, hour - 1, minute);
    // const task = cron.schedule(schedule, async () => {
    const task = cron.schedule("* * * * * *", async () => {
      try {
        console.log("creating meeting");
        // post request to /api/meetings/
        const newMeeting = new Meeting({
          division,
          date: new Date().addHours(1),
        });
        await newMeeting.save();
      } catch (err) {
        console.log(err);
        const error = new HttpError(err.message, 500);
        return next(error);
      }
      task.stop();
    });
  }

  next();
};
