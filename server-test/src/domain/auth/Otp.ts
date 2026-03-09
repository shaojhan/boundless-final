/**
 * Otp — Auth domain entity (one-time password for password reset)
 */
export interface Otp {
  id: number;
  userId: number;
  email: string;
  token: string;
  expTimestamp: bigint;
  createdAt: Date;
  updatedAt: Date;
}
