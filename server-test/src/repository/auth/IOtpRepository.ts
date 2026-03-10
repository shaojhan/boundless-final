export interface IOtpRepository {
  /**
   * Create or refresh an OTP token for the given email.
   * Returns the token string, or null if the email doesn't exist
   * or a valid OTP was already sent within the cooldown period.
   */
  createOrRefresh(email: string, expMinutes?: number, cooldownSeconds?: number): Promise<string | null>;

  /**
   * Validate the OTP token and update the user's password.
   * Returns the userId on success, or null if OTP is invalid/expired.
   */
  updatePassword(email: string, token: string, newPasswordHash: string): Promise<number | null>;
}
