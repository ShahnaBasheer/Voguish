const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: subject,
        text: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;