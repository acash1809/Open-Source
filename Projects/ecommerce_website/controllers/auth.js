const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const User = require("../models/user");

const emailer = require("../util/email");

const { validationResult } = require("express-validator/check");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: false,
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie','loggedIn=true');
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid Email or Password! o_O",
          oldInput: { email: email, password: password },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              // console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMessage: "Invalid Email or Password! o_O",
            oldInput: { email: email, password: password },
            validationErrors: [],
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "", address: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  console.log(email);
  const address = req.body.address;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
        address: req.body.address,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        address: address,
        cart: { items: [] },
        resetToken: null,
        resetTokenExpiration: Date.now(),
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      message = {
        to: email,
        from: {
          name: "SmartShoper",
          email: emailer.emailHost,
        },
        subject: "Signup Completed!",
        text: "Congratulations!. You are now successfully registered on SmartShoper!",
        html: `<h1>Congratulations!</h1>
              <br>
              <p>${email}, you are now successfully registered on SmartShoper! </p>`,
      };
      return emailer.setup
        .send(message)
        .then((response) => {
          console.log("Email sent");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      req.flash("error", "Token Generation Failed!");
      return res.redirect("/");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Invalid Email ID!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        message = {
          to: req.body.email,
          from: {
            name: "SmartShoper",
            email: emailer.emailHost,
          },
          subject: "Password Reset Request",
          text:
            "Hey, Here is your password reset link http://localhost:3000/reset/" +
            token +
            ". The link is valid for 60 minutes only!",
          html: `
            <p>Hey, Here is your password reset link:
            <a href="http://localhost:3000/reset/${token}">Click Here</a>
            <br>
            The Link is valid only for 60 minutes!
            </p>
          `,
        };
        return emailer.setup
          .send(message)
          .then((result) => {
            console.log("Password Reset Email Sent!");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        // console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "Set New Password",
        path: "/new-password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    _id: userId,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
