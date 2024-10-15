const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetUrl = `${origin}/api/v1/reset-password?token=${token}&email=${email}`;
  const message = `
  <p>Forgot your password?  
  <a href="${resetUrl}">-Click Here-</a>
  </p>
  `;
  return await sendEmail({
    to: email,
    subject: "Password Reset",
    html: `
    <h4>Hello ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendResetPasswordEmail;
