const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({ name, email, token, origin }) => {
  const verifyLink = `${origin}/api/v1/verify-email?token=${token}&email=${email}`;

  const message = `
  <p>
  Please Verify Your Email
  <a href="${verifyLink}">Click To Verify</a>
  </p>`;

  await sendEmail({
    to: email,
    subject: "Email Verification",
    html: `
    <h4>Hello ${name}</h4>
    ${message}
    `,
  });
};
module.exports = sendVerificationEmail;
