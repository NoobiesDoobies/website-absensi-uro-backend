const app = require("express")();
const bodyParser = require("body-parser");
const apiUserRouter = require("./routes/api-user-routes.js");
const apiMeetingRouter = require("./routes/api-meeting-routes.js");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");

const port = 5000;

// Handle CORS error
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // Allow these headers
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use(bodyParser.json());

app.use("/api/users", apiUserRouter);
app.use("/api/meetings", apiMeetingRouter);

// Handle unsupported routes
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// Error handler middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    "mongodb+srv://carlioseryan20:281003car@cluster0.plqxwwn.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
