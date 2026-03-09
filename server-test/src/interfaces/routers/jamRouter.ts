import express from 'express';
import { rename } from 'fs/promises';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import type { JamService } from '../../service/jam/JamService.js';
import {
  JamListQuerySchema,
  FormedJamListQuerySchema,
  JuidParamSchema,
  JuidUidParamSchema,
  UidParamSchema,
  CreateJamSchema,
  CreateApplySchema,
  UpdateJamFormSchema,
  JoinJamSchema,
  IdBodySchema,
  DecideApplySchema,
  DisbandSchema,
  QuitSchema,
  FormRightNowSchema,
  EditJamInfoSchema,
} from '../schemas/jamSchema.js';

const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = resolve(__dirname, '..', '..', 'public');
const upload = multer({ dest: publicDir });

export function createJamRouter(jamService: JamService) {
  const router = express.Router();

  // ── GET /api/jam/allJam ─────────────────────────────────────────────────────
  router.get('/allJam', async (req, res, next) => {
    const parsed = JamListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const q = parsed.data;
    try {
      const result = await jamService.findJams({
        degree: q.degree,
        genre: q.genre,
        player: q.player,
        region: q.region,
        order: q.order === 'DESC' ? 'desc' : 'asc',
        page: q.page,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // ── GET /api/jam/singleJam/:juid/:uid? ──────────────────────────────────────
  // path-to-regexp v8+ dropped `:param?` syntax — register two routes instead
  const handleSingleJam: import('express').RequestHandler = async (req, res, next) => {
    const parsed = JuidUidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的參數' });
    }
    try {
      const result = await jamService.findJamByJuid(parsed.data.juid, parsed.data.uid);
      if (result.status === 'formed') {
        return res.status(200).json({ status: 'formed' });
      }
      if (result.status === 'error') {
        return res.status(400).json({ status: 'error' });
      }
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
  router.get('/singleJam/:juid/:uid', handleSingleJam);
  router.get('/singleJam/:juid', handleSingleJam);

  // ── GET /api/jam/getMyApply/:uid ────────────────────────────────────────────
  router.get('/getMyApply/:uid', async (req, res, next) => {
    const parsed = UidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error' });
    }
    try {
      const data = await jamService.findMyApplies(parsed.data.uid);
      if (!data) {
        return res.status(400).json({ status: 'error' });
      }
      return res.status(200).json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /api/jam/allFormedJam ───────────────────────────────────────────────
  router.get('/allFormedJam', async (req, res, next) => {
    const parsed = FormedJamListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const q = parsed.data;
    try {
      const result = await jamService.findFormedJams({
        search: q.search,
        genre: q.genre,
        region: q.region,
        order: q.order === 'DESC' ? 'desc' : 'asc',
        page: q.page,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // ── GET /api/jam/singleFormedJam/:juid ─────────────────────────────────────
  router.get('/singleFormedJam/:juid', async (req, res, next) => {
    const parsed = JuidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的 juid' });
    }
    try {
      const result = await jamService.findFormedJamByJuid(parsed.data.juid);
      if (result.status === 'error') {
        return res.status(400).json({ status: 'error' });
      }
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // ── POST /api/jam/form ──────────────────────────────────────────────────────
  router.post('/form', upload.none(), async (req, res, next) => {
    const parsed = CreateJamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const b = parsed.data;
    try {
      const juid = await jamService.createJam({
        uid: b.uid,
        title: b.title,
        degree: b.degree,
        genre: b.genre,
        former: b.former,
        players: b.players,
        region: b.region,
        band_condition: b.condition,
        description: b.description,
      });
      return res.status(200).json({ status: 'success', juid });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /api/jam/apply ─────────────────────────────────────────────────────
  router.post('/apply', upload.none(), async (req, res, next) => {
    const parsed = CreateApplySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      await jamService.createApply(parsed.data);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/updateForm ─────────────────────────────────────────────────
  router.put('/updateForm', upload.none(), async (req, res, next) => {
    const parsed = UpdateJamFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const { juid, ...data } = parsed.data;
    try {
      await jamService.updateJamForm(juid, data);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/joinJam ────────────────────────────────────────────────────
  router.put('/joinJam', upload.none(), async (req, res, next) => {
    const parsed = JoinJamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const { user_id, user_uid, juid, applier_play } = parsed.data;
    try {
      const status = await jamService.joinJam(user_id, user_uid, juid, applier_play);
      return res.status(200).json({ status });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/cancelApply ────────────────────────────────────────────────
  router.put('/cancelApply', upload.none(), async (req, res, next) => {
    const parsed = IdBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的 id' });
    }
    try {
      await jamService.cancelApply(parsed.data.id);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/deleteApply ────────────────────────────────────────────────
  router.put('/deleteApply', upload.none(), async (req, res, next) => {
    const parsed = IdBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: '無效的 id' });
    }
    try {
      await jamService.deleteApply(parsed.data.id);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/decideApply ────────────────────────────────────────────────
  router.put('/decideApply', upload.none(), async (req, res, next) => {
    const parsed = DecideApplySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      const result = await jamService.decideApply(parsed.data.id, parsed.data.state);
      if (result === 'cancel') {
        return res.status(200).json({ status: 'cancel' });
      }
      return res.status(200).json({ status: 'success', state: parsed.data.state });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/disband ────────────────────────────────────────────────────
  router.put('/disband', upload.none(), async (req, res, next) => {
    const parsed = DisbandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const uidList: string[] = JSON.parse(parsed.data.ids);
    try {
      await jamService.disbandJam(parsed.data.juid, uidList);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/quit ───────────────────────────────────────────────────────
  router.put('/quit', upload.none(), async (req, res, next) => {
    const parsed = QuitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      await jamService.quitJam(parsed.data.id, parsed.data.juid, parsed.data.playname);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/formRightNow ───────────────────────────────────────────────
  router.put('/formRightNow', upload.none(), async (req, res, next) => {
    const parsed = FormRightNowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      await jamService.formJamNow(parsed.data.juid);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  // ── PUT /api/jam/editInfo ───────────────────────────────────────────────────
  router.put('/editInfo', upload.single('cover_img'), async (req, res, next) => {
    const parsed = EditJamInfoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ status: 'error', message: parsed.error.issues[0].message });
    }
    const { juid, ...data } = parsed.data;
    let coverImg: string | undefined;
    if (req.file) {
      coverImg = Date.now() + extname(req.file.originalname);
      await rename(req.file.path, resolve(publicDir, 'jam', coverImg)).catch((err) =>
        console.error('更名失敗', err)
      );
    }
    try {
      await jamService.editJamInfo(juid, data, coverImg);
      return res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
