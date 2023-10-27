const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userControllers");

router.get("/:uid", userController.getUserById);

router.get("/", userController.getUsers);

router.post(
  "/",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
    check("position").not().isEmpty(),
    check("generation").not().isEmpty(),
  ],
  userController.createUser
);

router.patch("/attend/:uid", userController.attendMeeting);

router.patch(
  "/:uid",
  [
    check("name").not().isEmpty(),
    check("password").isLength({ min: 6 }),
    check("position").not().isEmpty(),
  ],
  userController.updateUserById
);


router.delete("/:uid", userController.deleteUserById);

router.get("/meetings", userController.getMeetingsAttendedByUserId);

module.exports = router;
