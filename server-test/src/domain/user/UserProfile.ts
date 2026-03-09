/**
 * UserProfile — User domain types (profile-focused, beyond auth).
 * Pure TypeScript, no Prisma / Express imports.
 */

export interface UserProfile {
  id: number;
  uid: string;
  name: string;
  email: string;
  nickname: string | null;
  phone: string | null;
  birthday: Date | null;
  postcode: number | null;
  country: string | null;
  township: string | null;
  address: string | null;
  genreLike: string | null;
  playInstrument: string | null;
  info: string | null;
  gender: string | null;
  privacy: number | null;
  googleUid: string | null;
  myJam: string | null;
  photoUrl: string | null;
  myLesson: string | null;
  img: string | null;
  valid: number;
}

/** Public profile returned by GET /user-homepage/:uid */
export interface PublicUserHomepage {
  email: string;
  nickname: string | null;
  phone: string | null;
  birthday: Date | null;
  genre_like: string | null;
  play_instrument: string | null;
  info: string | null;
  gender: string | null;
  privacy: number | null;
  my_jam: string | null;      // jam name or null
  my_jamState: number | null; // jam state or null
  photo_url: string | null;
  img: string | null;
}

/** UserProfile enriched with jam name/state for GET /:id */
export interface UserWithJam {
  id: number;
  uid: string;
  name: string;
  email: string;
  nickname: string | null;
  phone: string | null;
  birthday: Date | null;
  postcode: number | null;
  country: string | null;
  township: string | null;
  address: string | null;
  genre_like: string | null;
  play_instrument: string | null;
  info: string | null;
  gender: string | null;
  privacy: number | null;
  google_uid: string | null;
  my_jam: string | null;
  photo_url: string | null;
  my_lesson: string | null;
  img: string | null;
  my_jamState: number | null;
  my_jamname: string | null;
}

export interface UpdateProfileInput {
  email?: string;
  name?: string;
  phone?: string | null;
  postcode?: number | null;
  country?: string | null;
  township?: string | null;
  address?: string | null;
  birthday?: Date | null;
  genreLike?: string | null;
  playInstrument?: string | null;
  info?: string | null;
  gender?: string | null;
  nickname?: string | null;
  privacy?: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OrderItem = Record<string, any>;
