const emailjs = require("@emailjs/nodejs");

const sendPasswordResetEmail = async (options) => {
  try {
    // Initialize EmailJS with your credentials
    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY, // Only needed for server-side
    });

    // Send the email
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: options.email,
        subject: options.subject,
        message: options.message,
        reset_link: options.resetUrl, // If you're including a reset link
        from_name: "Video Editor Portfolio",
      }
    );

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendPasswordResetEmail;
