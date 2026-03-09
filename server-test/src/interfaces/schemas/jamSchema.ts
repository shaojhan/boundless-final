import { z } from 'zod';

// ── Query params ──────────────────────────────────────────────────────────────

export const JamListQuerySchema = z.object({
  order: z.enum(['ASC', 'DESC']).optional(),
  degree: z.coerce.number().int().optional(),
  genre: z.string().optional(),
  player: z.string().optional(),
  region: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
});

export const FormedJamListQuerySchema = z.object({
  order: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().optional(),
  genre: z.string().optional(),
  region: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
});

// ── Path params ───────────────────────────────────────────────────────────────

export const JuidParamSchema = z.object({
  juid: z.string().min(1),
});

export const JuidUidParamSchema = z.object({
  juid: z.string().min(1),
  uid: z.string().optional(),
});

export const UidParamSchema = z.object({
  uid: z.string().min(1),
});

// ── Request bodies ────────────────────────────────────────────────────────────

export const CreateJamSchema = z.object({
  uid: z.string().min(1),
  title: z.string().min(1),
  degree: z.coerce.number().int(),
  genre: z.string().min(1),
  former: z.string().min(1),
  players: z.string().min(1),
  region: z.string().min(1),
  condition: z.string(),
  description: z.string().min(1),
});

export const CreateApplySchema = z.object({
  juid: z.string().min(1),
  former_uid: z.string().min(1),
  applier_uid: z.string().min(1),
  applier_play: z.coerce.number().int(),
  message: z.string(),
});

export const UpdateJamFormSchema = z.object({
  juid: z.string().min(1),
  title: z.string().min(1),
  condition: z.string(),
  description: z.string().min(1),
});

export const JoinJamSchema = z.object({
  user_id: z.coerce.number().int(),
  user_uid: z.string().min(1),
  juid: z.string().min(1),
  applier_play: z.coerce.number().int(),
});

export const IdBodySchema = z.object({
  id: z.coerce.number().int(),
});

export const DecideApplySchema = z.object({
  id: z.coerce.number().int(),
  state: z.coerce.number().int(),
});

export const DisbandSchema = z.object({
  juid: z.string().min(1),
  /** JSON-encoded string[] of member UIDs */
  ids: z.string().min(1),
});

export const QuitSchema = z.object({
  id: z.coerce.number().int(),
  juid: z.string().min(1),
  playname: z.string().min(1),
});

export const FormRightNowSchema = z.object({
  juid: z.string().min(1),
});

export const EditJamInfoSchema = z.object({
  juid: z.string().min(1),
  bandName: z.string().min(1),
  introduce: z.string(),
  works_link: z.string(),
});
