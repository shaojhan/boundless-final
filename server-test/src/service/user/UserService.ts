import type { IUserProfileRepository } from '#repository/user/IUserProfileRepository.js';
import type {
  UserProfile,
  PublicUserHomepage,
  UserWithJam,
  UpdateProfileInput,
  OrderItem,
} from '#domain/user/UserProfile.js';

export class UserService {
  constructor(private readonly repo: IUserProfileRepository) {}

  async getProfile(id: number): Promise<UserProfile | null> {
    return this.repo.findById(id);
  }

  async getProfileByUid(uid: string): Promise<UserProfile | null> {
    return this.repo.findByUid(uid);
  }

  async getPublicHomepage(uid: string): Promise<PublicUserHomepage | null> {
    return this.repo.getPublicHomepage(uid);
  }

  async getUserWithJam(id: number): Promise<UserWithJam | null> {
    return this.repo.getUserWithJam(id);
  }

  async updateProfile(id: number, data: UpdateProfileInput): Promise<UserProfile> {
    return this.repo.updateProfile(id, data);
  }

  async updateAvatar(id: number, img: string): Promise<void> {
    return this.repo.updateAvatar(id, img);
  }

  async getOrders(uid: string): Promise<OrderItem[][]> {
    return this.repo.getOrders(uid);
  }
}
