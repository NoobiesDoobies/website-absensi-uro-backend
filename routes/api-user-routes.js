const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userControllers");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

router.get("/:uid", userController.getUserById);

router.get("/", userController.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
    check("position").not().isEmpty(),
    check("generation").not().isEmpty(),
  ],
  userController.signup
);

router.post(
  "/login",
  [
    check("email")
      .normalizeEmail() // Test@testcom => test@testcom
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.login
);

router.use(checkAuth);

router.patch("/update-password", userController.updatePassword);

router.patch(
  "/",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("password").isLength({ min: 6 }),
    check("position").not().isEmpty(),
  ],
  userController.updateUserById
);


router.delete("/", userController.deleteUserById);

router.get("/meetings", userController.getMeetingsAttendedByUserId);

router.post("/attend", userController.attendMeeting);

module.exports = router;
