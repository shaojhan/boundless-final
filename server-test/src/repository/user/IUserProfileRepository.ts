import type {
  UserProfile,
  PublicUserHomepage,
  UserWithJam,
  UpdateProfileInput,
  OrderItem,
} from '../../domain/user/UserProfile.js';

export interface IUserProfileRepository {
  findById(id: number): Promise<UserProfile | null>;
  findByUid(uid: string): Promise<UserProfile | null>;
  getPublicHomepage(uid: string): Promise<PublicUserHomepage | null>;
  getUserWithJam(id: number): Promise<UserWithJam | null>;
  updateProfile(id: number, data: UpdateProfileInput): Promise<UserProfile>;
  updateAvatar(id: number, img: string): Promise<void>;
  getOrders(uid: string): Promise<OrderItem[][]>;
}
