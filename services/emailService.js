const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  secure: true,
  tls: { rejectUnauthorized: false },
});

const sendPasswordResetEmail = async (email, newPassword, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thông báo đặt lại mật khẩu",
      html: `
        <h1>Thông báo đặt lại mật khẩu</h1>
        <p>Xin chào user "${username}",</p>
        <p>Mật khẩu của bạn đã được đặt lại bởi admin.</p>
        <p>Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>
       
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Lỗi khi gửi email: ", error.message);
    console.error("Chi tiết lỗi: ", error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
