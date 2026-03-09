/**
 * RefreshToken — Auth domain entity
 */
export interface RefreshToken {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
}
