import nodemailer from 'nodemailer';
import 'dotenv/config.js';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER ?? 'localhost',
  port: Number(process.env.MAIL_PORT ?? 1025),
  secure: false,
  auth:
    process.env.MAIL_USERNAME
      ? { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD }
      : undefined,
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
