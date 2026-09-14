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
});


async function generateOTP(data) {
    const otp = createOTP();
    await transporter.sendMail({
    from: `"CodeRush" <${process.env.EMAIL_USER}>`,
    to: data.emailId,
    subject: "Your CodeRush Verification Code",
    text: `
Dear User,

We received a request to verify the email address associated with your CodeRush account.

Your verification code is:

${otp}

This verification code is valid for 5 minutes and can be used only once.

For your security, please do not share this code with anyone. CodeRush will never ask you to disclose your verification code or password.

If you did not request this verification code, no further action is required. You may safely ignore this email.

This is an automated message. Please do not reply to this email.

Regards,
CodeRush Team
`
});
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