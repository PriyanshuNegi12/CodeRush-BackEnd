const nodemailer = require("nodemailer");
const crypto = require("crypto");
const client = require("../config/Redis");


function createOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000, // 10s to establish connection
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

async function generateOTP(data) {
  const otp = createOTP();
  try {
    await transporter.sendMail({
      from: `"CodeRush" <${process.env.EMAIL_USER}>`,
      to: data.emailId,
      subject: "Your CodeRush Verification Code",
      text: `...`,
    });
  } catch (err) {
    console.error("[generateOTP] sendMail failed:", err.message);
    throw new Error("Failed to send verification email. Please try again.");
  }
  return otp;
}

async function validateOTP(data) {
  const IsAvailable = await client.exists(`OTP:${data.emailId}`);
  if(!IsAvailable) throw new Error("Invalid Mail!!!");
  const otp = await client.get(`OTP:${data.emailId}`);
  if(otp===data.otp){
    await client.del(`OTP:${data.emailId}`);
    return true;
  }
  return false;
}

module.exports = {generateOTP, validateOTP};