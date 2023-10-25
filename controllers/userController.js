const HttpError = require("../models/http-error");

const User = require("../models/User");

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

const createUser = async (req, res, next) => {
  const createdUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    position: req.body.position,
    generation: req.body.generation,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }
  res
    .status(201)
    .json({
      message: "User created!",
      user: createdUser.toObject({ getters: true }),
    });
};

const getUserById = (req, res, next) => {};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.getUserById = getUserById;
