const express = require("express");
const { check, body } = require("express-validator");
// const { check, body } = require("express-validator/check");
const router = express.Router();

const User = require("../models/user");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Email seems to be in incorrect format")
      .normalizeEmail(),

    body("password", "Password isn't in valid format :3")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Enter a valid Email ID!")
      .custom((value, { req }) => {
        //   if (value === "test@test.com") {
        //     throw new Error("This Email Id is forbidden");
        //   }
        //   return true; //if it succeeds
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) return Promise.reject("User already Exists!");
        });
      }),

    body("address", "Address Invalid. Max Characters 99").isLength({
      min: 1,
      max: 99,
    }),

    body(
      "password",
      "Please enter a password that is atlesat 5 characters long and is alphaNumeric"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),

    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords should match!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
