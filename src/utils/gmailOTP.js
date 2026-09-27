const crypto = require("crypto");
const client = require("../config/Redis");

function createOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

async function generateOTP(data) {
  const otp = createOTP();
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CodeRush", email: process.env.EMAIL_USER },
        to: [{ email: data.emailId }],
        subject: "Your CodeRush Verification Code",
        textContent: `Dear User,

We received a request to verify the email address associated with your CodeRush account.

Your verification code is:

${otp}

This verification code is valid for 5 minutes and can be used only once.

For your security, please do not share this code with anyone. CodeRush will never ask you to disclose your verification code or password.

If you did not request this verification code, no further action is required. You may safely ignore this email.

This is an automated message. Please do not reply to this email.

Regards,
CodeRush Team`,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[generateOTP] Brevo failed:", res.status, errBody);
      throw new Error("Failed to send verification email. Please try again.");
    }
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