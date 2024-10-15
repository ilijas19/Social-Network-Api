const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: "ilijagocic19@gmail.com", // Change to your verified sender
      subject,
      html,
    };
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
