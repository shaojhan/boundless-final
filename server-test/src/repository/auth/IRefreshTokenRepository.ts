export interface IRefreshTokenRepository {
  create(userId: number): Promise<string>;
  findValid(token: string): Promise<{ userId: number } | null>;
  delete(token: string): Promise<void>;
  deleteByUserId(userId: number): Promise<void>;
}
