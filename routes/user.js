const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

router.post(
  "/signUp",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please enter a password atleast 5 characters long"),
  ],
  userController.signUp
);

router.post(
  "/signIn",
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),
  userController.signIn
);

module.exports = router;
