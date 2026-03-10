import type { User, UserPublic, NewUserInput, GoogleUserInput } from '#domain/auth/User.js';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUid(uid: string): Promise<User | null>;
  findByGoogleUid(googleUid: string): Promise<UserPublic | null>;
  /** Create a local user (email + password). Returns public projection. */
  createUser(input: NewUserInput): Promise<UserPublic>;
  /** Create a Google-authenticated user. Returns public projection. */
  createGoogleUser(input: GoogleUserInput): Promise<UserPublic>;
  /** Grant a welcome coupon to a new user (coupon_template_id = 1) */
  grantWelcomeCoupon(userId: number): Promise<void>;
}
