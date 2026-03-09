/**
 * User — Auth domain entity
 * Pure TypeScript, no Prisma / Express imports.
 */
export interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  nickname: string | null;
  phone: string | null;
  birthday: Date;
  img: string | null;
  googleUid: string | null;
  photoUrl: string | null;
  myJam: string | null;
  valid: number;
  createdTime: Date;
  updatedTime: Date;
}

/** Minimal projection used in JWT payload / responses */
export interface UserPublic {
  id: number;
  uid: string;
  name: string;
  email: string;
  img: string | null;
  myJam: string | null;
}

/** Data required to create a new user */
export interface NewUserInput {
  name: string;
  email: string;
  password: string;
}

/** Data for Google-authenticated user creation */
export interface GoogleUserInput {
  googleUid: string;
  email: string;
  name: string;
  photoUrl?: string;
}
