import { generateToken } from '#configs/otp.js';
import db from '#db';
import { generateHash } from '#db-helpers/password-hash.js';
import type { UserRow, OtpRow } from '../types/index.js';

// 判斷是否可以重設token, true代表可以重設
const shouldReset = (
  expTimestamp: number,
  exp: number,
  limit = 60
): boolean => {
  const createdTimestamp = expTimestamp - exp * 60 * 1000;
  return Date.now() - createdTimestamp > limit * 1000;
};

// exp = 30 分到期, limit = 60 是 60秒內不產生新的token
const createOtp = async (
  email: string,
  exp = 30,
  limit = 60
): Promise<Partial<OtpRow> | Record<string, never>> => {
  const [users] = await db.execute<UserRow>(
    'SELECT * FROM user WHERE email = ? LIMIT 1',
    [email]
  );
  const user = (users as UserRow[])[0];

  if (!user) {
    console.error('ERROR - 使用者帳號不存在');
    return {};
  }

  const [otps] = await db.execute<OtpRow>(
    'SELECT * FROM otp WHERE email = ? LIMIT 1',
    [email]
  );
  const foundOtp = (otps as OtpRow[])[0];

  if (foundOtp && !shouldReset(Number(foundOtp.exp_timestamp), exp, limit)) {
    console.error('ERROR - 60s(秒)內要求重新產生otp');
    return {};
  }

  if (foundOtp && shouldReset(Number(foundOtp.exp_timestamp), exp, limit)) {
    const token = generateToken(email);
    const exp_timestamp = Date.now() + exp * 60 * 1000;

    await db.execute(
      'UPDATE otp SET token = ?, exp_timestamp = ? WHERE email = ?',
      [token, exp_timestamp, email]
    );

    return { ...foundOtp, exp_timestamp, token };
  }

  const token = generateToken(email);
  const exp_timestamp = Date.now() + exp * 60 * 1000;

  await db.execute(
    'INSERT INTO otp (user_id, email, token, exp_timestamp, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [user.id, email, token, exp_timestamp]
  );

  const [newOtps] = await db.execute<OtpRow>(
    'SELECT * FROM otp WHERE email = ? LIMIT 1',
    [email]
  );
  return (newOtps as OtpRow[])[0] || {};
};

// 更新密碼
const updatePassword = async (
  email: string,
  token: string,
  password: string
): Promise<boolean> => {
  const [otps] = await db.execute<OtpRow>(
    'SELECT * FROM otp WHERE email = ? AND token = ? LIMIT 1',
    [email, token]
  );
  const foundOtp = (otps as OtpRow[])[0];

  if (!foundOtp) {
    console.error('ERROR - OTP Token資料不存在');
    return false;
  }

  if (Date.now() > Number(foundOtp.exp_timestamp)) {
    console.error('ERROR - OTP Token已到期');
    return false;
  }

  const hashedPassword = await generateHash(password);
  await db.execute('UPDATE user SET password = ? WHERE id = ?', [
    hashedPassword,
    foundOtp.user_id,
  ]);

  await db.execute('DELETE FROM otp WHERE id = ?', [foundOtp.id]);

  return true;
};

export { createOtp, updatePassword };
