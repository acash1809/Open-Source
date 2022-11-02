const nodeMailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const dotenv = require("dotenv");
dotenv.config();

sgMail.setApiKey(process.env.EMAIL_API_KEY);

const emailHost = process.env.MASTER_EMAIL;

module.exports = {
  setup: sgMail,
  emailHost: emailHost,
};
