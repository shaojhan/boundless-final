/**
 * Jam Domain Entities
 * Pure TypeScript — no Prisma / Express imports.
 */

// ── Lookup tables ─────────────────────────────────────────────────────────────

export interface GenreItem {
  id: number;
  name: string;
}

export interface PlayerItem {
  id: number;
  name: string;
}

// ── Core stored shapes (JSON fields parsed from DB) ───────────────────────────

export interface JamFormer {
  id: number;
  play: number;
}

export interface JamMemberRaw {
  id: number;
  play: number;
}

// ── Enriched shapes (user profile joined) ─────────────────────────────────────

export interface UserProfile {
  id: number;
  uid: string;
  name: string;
  img: string | null;
  nickname: string | null;
}

export interface JamFormerEnriched {
  id: number;
  play: number | string;
  uid?: string;
  name?: string | null;
  img?: string | null;
  nickname?: string | null;
}

export interface JamMemberEnriched {
  id: number;
  play: number | string;
  uid?: string;
  name?: string | null;
  img?: string | null;
  nickname?: string | null;
}

// ── List / Detail result shapes ───────────────────────────────────────────────

export interface JamListRow {
  id: number;
  juid: string;
  former: JamFormer;
  member: JamMemberRaw[];
  name: string | null;
  title: string;
  description: string;
  degree: number;
  /** parsed genre IDs */
  genre: number[];
  /** parsed player IDs (renamed from `players` to match original route) */
  player: number[];
  region: string;
  band_condition: string | null;
  created_time: Date;
  updated_time: Date | null;
  state: number;
  valid: number;
}

export interface JamListResult {
  genreData: GenreItem[];
  playerData: PlayerItem[];
  jamData: JamListRow[];
  formerData: UserProfile[];
  pageTotal: number;
  page: number;
}

export interface JamApplyEnriched {
  id: number;
  juid: string;
  former_uid: string;
  applier_uid: string;
  applier_play: number;
  message: string;
  state: number;
  /** formatted date string */
  created_time: string;
  valid: number;
  play?: string;
  applier?: UserProfile;
}

export interface JamDetailResult {
  status: 'formed' | 'success' | 'error';
  genreData?: GenreItem[];
  playerData?: PlayerItem[];
  jamData?: Record<string, unknown>;
  applyData?: JamApplyEnriched[];
  myApplyState?: Array<{ state: number }>;
}

export interface FormedJamListRow {
  juid: string;
  name: string | null;
  cover_img: string | null;
  genre: number[];
  formed_time: Date | null;
  region: string;
}

export interface FormedJamListResult {
  genreData: GenreItem[] | undefined;
  jamData: FormedJamListRow[];
  pageTotal: number;
  page: number;
}

export interface FormedJamDetailResult {
  status: 'success' | 'error';
  genreData?: GenreItem[];
  jamData?: Record<string, unknown>;
}

export interface MyApplyItem {
  id: number;
  juid: string;
  former_uid: string;
  applier_uid: string;
  applier_play: number;
  message: string;
  state: number;
  created_time: Date;
  valid: number;
  title: string;
  applier_playname?: string;
}

// ── Filter options ────────────────────────────────────────────────────────────

export interface JamFindOptions {
  degree?: number;
  genre?: string;
  player?: string;
  region?: string;
  order?: 'asc' | 'desc';
  page?: number;
}

export interface FormedJamFindOptions {
  search?: string;
  genre?: string;
  region?: string;
  order?: 'asc' | 'desc';
  page?: number;
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface CreateJamInput {
  uid: string;
  title: string;
  degree: number;
  /** JSON string e.g. "[1,2]" */
  genre: string;
  /** JSON string e.g. '{"id":1,"play":2}' */
  former: string;
  /** JSON string e.g. "[1,2,3]" */
  players: string;
  region: string;
  band_condition: string;
  description: string;
}

export interface CreateApplyInput {
  juid: string;
  former_uid: string;
  applier_uid: string;
  applier_play: number;
  message: string;
}

export interface UpdateJamFormInput {
  title: string;
  condition: string;
  description: string;
}

export interface EditJamInfoInput {
  bandName: string;
  introduce: string;
  works_link: string;
}
