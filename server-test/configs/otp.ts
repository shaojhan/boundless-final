import * as OTPAuth from 'otpauth';
import 'dotenv/config.js';

const otpSecret = process.env.OTP_SECRET;

let totp: OTPAuth.TOTP | null = null;

// Generate a token for the given email (uses email+sharedSecret as the TOTP secret)
const generateToken = (email = ''): string => {
  totp = new OTPAuth.TOTP({
    issuer: 'express-base',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromLatin1(email + otpSecret),
  });

  return totp.generate();
};

// Validate a token within the search window (default 30s)
const verifyToken = (token: string): boolean => {
  if (!totp) return false;
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
};

export { generateToken, verifyToken };
