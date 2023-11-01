const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if(req.method === "OPTIONS") {
    console.log("Handling OPTIONS request")
    return next();
  }

  const token = req.headers.authorization.split(" ")[1];
  try {
    if (!token) {
      throw new Error("Authentication failed");
    }

    const decodedToken = jwt.verify(token, "KEY_SECRET");
    req.userData = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      isAdmin: decodedToken.isAdmin,
    };
    console.log("Auth success")
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
