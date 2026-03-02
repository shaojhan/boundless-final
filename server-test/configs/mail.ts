import nodemailer from 'nodemailer';
import 'dotenv/config.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_TO_EMAIL,
    pass: process.env.SMTP_TO_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error(
      'ERROR - 無法連線至SMTP伺服器 Unable to connect to the SMTP server.'
    );
  } else {
    console.info('INFO - SMTP伺服器已連線 SMTP server connected.');
  }
});

export default transporter;
