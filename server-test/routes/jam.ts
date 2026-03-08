import express from 'express';
import prisma from '#configs/prisma.js';
import multer from 'multer';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { rename } from 'fs/promises';

const router = express.Router();
const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
const upload = multer({ dest: resolve(__dirname, 'public') });

// 用於 jam 分頁：30天內未過期
function jamExpiry() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

// 樂手查詢欄位 select
const userSelect = {
  id: true,
  uid: true,
  name: true,
  img: true,
  nickname: true,
} as const;

// genre/player 欄位存為 JSON 字串陣列，使用 Prisma string filter 比對
function jsonArrayFilter(value: string) {
  return {
    OR: [
      { endsWith: `,${value}]` }, // LIKE '%,X]'
      { startsWith: `[${value},` }, // LIKE '[X,%'
      { contains: `,${value},` }, // LIKE '%,X,%'
      { equals: `[${value}]` }, // = '[X]'
    ],
  };
}

// 取得所有組團資料
router.get('/allJam', async (req, res) => {
  const [genreData, playerData] = await Promise.all([
    prisma.genre.findMany(),
    prisma.player.findMany(),
  ]);

  const expiry = jamExpiry();
  const orderDirection = (req.query.order === 'DESC' ? 'desc' : 'asc') as
    | 'asc'
    | 'desc';

  const hasQuery = Object.keys(req.query).length !== 0;

  // Build Prisma where clause from filters
  const buildWhere = () => {
    const where: Record<string, unknown> = {
      valid: 1,
      state: 0,
      created_time: { gt: expiry },
    };
    if (req.query.degree && req.query.degree !== 'all') {
      where.degree = parseInt(String(req.query.degree));
    }
    if (req.query.genre && req.query.genre !== 'all') {
      where.genre = jsonArrayFilter(String(req.query.genre));
    }
    if (req.query.player && req.query.player !== 'all') {
      where.players = jsonArrayFilter(String(req.query.player));
    }
    if (req.query.region && req.query.region !== 'all') {
      where.region = String(req.query.region);
    }
    return where;
  };

  const where = hasQuery
    ? buildWhere()
    : { valid: 1, state: 0, created_time: { gt: expiry } };

  const totalCount = await prisma.jam.count({ where });

  const page = Number(req.query.page) || 1;
  const dataPerpage = 10;
  const offset = (page - 1) * dataPerpage;
  const pageTotal = Math.ceil(totalCount / dataPerpage);

  const rows = await prisma.jam
    .findMany({
      where,
      orderBy: { created_time: orderDirection },
      take: dataPerpage,
      skip: offset,
    })
    .catch(() => undefined);

  if (!rows) {
    return res.status(400).send('發生錯誤');
  }

  const jamData = rows.map((v) => {
    let setMember: unknown[] = [];
    if (v.member) {
      setMember = JSON.parse(v.member);
    }
    return {
      ...v,
      former: JSON.parse(v.former),
      member: setMember,
      player: JSON.parse(v.players),
      genre: JSON.parse(v.genre),
    };
  });

  const formerIds = jamData.map((v) => (v.former as { id: number }).id);
  const formerData = await prisma.user.findMany({
    where: { id: { in: formerIds } },
    select: userSelect,
  });

  res
    .status(200)
    .json({ genreData, playerData, jamData, formerData, pageTotal, page });
});

// 組團資訊頁，獲得單筆資料
router.get('/singleJam/:juid{/:uid}', async (req, res) => {
  const juid = req.params.juid as string;

  // 檢查該樂團是否已經成團，條件: 未解散(valid=1)，已成團(state=1)
  const checkFormed = await prisma.jam
    .findFirst({ where: { juid, valid: 1, state: 1 } })
    .catch(() => undefined);
  if (checkFormed) {
    res.status(200).json({ status: 'formed' });
    return;
  }

  let myApplyState: { state: number }[] = [];
  const paramsUid = (req.params as Record<string, string>).uid;
  if (paramsUid) {
    myApplyState = await prisma.jamApply
      .findMany({
        where: { applier_uid: paramsUid, juid },
        select: { state: true },
      })
      .catch(() => []);
  }

  const [genreData, playerData] = await Promise.all([
    prisma.genre.findMany().catch(() => undefined),
    prisma.player.findMany().catch(() => undefined),
  ]);

  const expiry = jamExpiry();
  const jamRow = await prisma.jam
    .findFirst({ where: { juid, valid: 1, created_time: { gt: expiry } } })
    .catch(() => undefined);

  if (!jamRow) {
    return res.status(400).json({ status: 'error' });
  }

  let setMember: unknown[] = [];
  if (jamRow.member !== '[]' || jamRow.member) {
    setMember = JSON.parse(jamRow.member);
  }
  const jamData: Record<string, unknown> = {
    ...jamRow,
    member: setMember,
    former: JSON.parse(jamRow.former),
    player: JSON.parse(jamRow.players),
    genre: JSON.parse(jamRow.genre),
  };

  // 撈取申請資料
  let applyData = await prisma.jamApply
    .findMany({ where: { valid: 1, juid } })
    .catch(() => []);

  if (applyData.length > 0) {
    applyData = applyData.map((v) => {
      const createdDate = new Date(v.created_time)
        .toLocaleString()
        .split(' ')[0]
        .replace(/\//g, '-');
      return { ...v, created_time: createdDate };
    }) as typeof applyData;

    applyData = applyData.map((v) => {
      const matchPlay = playerData.find((pv) => pv.id === v.applier_play)?.name;
      return { ...v, play: matchPlay };
    }) as typeof applyData;

    // 合併申請者資料
    const applierUids = applyData.map((v) => v.applier_uid);
    const appliers = await prisma.user
      .findMany({
        where: { uid: { in: applierUids } },
        select: userSelect,
      })
      .catch(() => undefined);

    applyData = applyData.map((v) => {
      const matchUser = appliers?.find((av) => av.uid === v.applier_uid);
      return { ...v, applier: matchUser };
    }) as typeof applyData;
  }

  // 發起人資料
  const formerID = (jamData.former as { id: number }).id;
  const formerUser = await prisma.user
    .findUnique({ where: { id: formerID }, select: userSelect })
    .catch(() => undefined);

  (jamData.former as Record<string, unknown>).play = playerData?.find(
    (v) => v.id === (jamData.former as { play: number }).play
  )?.name;
  jamData.former = {
    ...(jamData.former as object),
    uid: formerUser?.uid,
    name: formerUser?.name,
    img: formerUser?.img,
    nickname: formerUser?.nickname,
  };

  // 成員資料
  const members = jamData.member as { id: number; play: number }[];
  if (members.length > 0) {
    const memberIds = members.map((v) => v.id);
    const memberData = await prisma.user
      .findMany({ where: { id: { in: memberIds } }, select: userSelect })
      .catch(() => undefined);

    jamData.member = members
      .map((v) => {
        const match = playerData?.find((pv) => pv.id === v.play);
        return { ...v, play: match?.name };
      })
      .map((v) => {
        const match = memberData?.find((mv) => mv.id === v.id);
        return {
          ...v,
          uid: match?.uid,
          name: match?.name,
          img: match?.img,
          nickname: match?.nickname,
        };
      });
  }

  res.status(200).json({
    status: 'success',
    genreData,
    playerData,
    jamData,
    applyData,
    myApplyState,
  });
});

// 取得會員中心的樂團申請一覽
router.get('/getMyApply/:uid', async (req, res) => {
  const uid = req.params.uid as string;

  const applyRows = await prisma.jamApply
    .findMany({
      where: { valid: 1, applier_uid: uid },
      include: { jam: { select: { title: true } } },
    })
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  if (!applyRows || applyRows.length === 0) {
    return res.status(400).json({ status: 'error' });
  }

  const playerData = await prisma.player.findMany().catch(() => undefined);

  // Flatten jam.title into each apply row
  let data = applyRows.map((v) => {
    const { jam, ...applyFields } = v;
    const match = playerData?.find(
      (pv) => pv.id === applyFields.applier_play
    )?.name;
    return { ...applyFields, title: jam.title, applier_playname: match };
  });

  // 過濾解散、已成團、發起失敗(過期)的jam
  const expiry = jamExpiry();
  const allJuids = data.map((v) => v.juid);
  const invalidJams = await prisma.jam
    .findMany({
      where: {
        valid: 0,
        state: 1,
        created_time: { lt: expiry },
        juid: { in: allJuids },
      },
      select: { juid: true },
    })
    .catch(() => undefined);

  if (invalidJams && invalidJams.length > 0) {
    const invalidJuids = new Set(invalidJams.map((j) => j.juid));
    data = data.filter((v) => !invalidJuids.has(v.juid));
  }

  res.status(200).json({ status: 'success', data });
});

// 取得所有已成立的樂團資料
router.get('/allFormedJam', async (req, res) => {
  const genreData = await prisma.genre.findMany().catch((error) => {
    console.error(error);
    return undefined;
  });

  const orderDirection = (req.query.order === 'DESC' ? 'desc' : 'asc') as
    | 'asc'
    | 'desc';

  const hasQuery = Object.keys(req.query).length !== 0;

  const buildFormedWhere = () => {
    const where: Record<string, unknown> = { valid: 1, state: 1 };
    const decoded = decodeURIComponent(String(req.query.search ?? ''));
    if (decoded) {
      where.name = { contains: decoded };
    }
    if (req.query.genre && req.query.genre !== 'all') {
      where.genre = jsonArrayFilter(String(req.query.genre));
    }
    if (req.query.region && req.query.region !== 'all') {
      where.region = String(req.query.region);
    }
    return where;
  };

  const where = hasQuery ? buildFormedWhere() : { valid: 1, state: 1 };

  const totalCount = await prisma.jam.count({ where });

  const page = Number(req.query.page) || 1;
  const dataPerpage = 10;
  const offset = (page - 1) * dataPerpage;
  const pageTotal = Math.ceil(totalCount / dataPerpage);

  const rows = await prisma.jam
    .findMany({
      where,
      orderBy: { formed_time: orderDirection },
      take: dataPerpage,
      skip: offset,
      select: {
        juid: true,
        name: true,
        cover_img: true,
        genre: true,
        formed_time: true,
        region: true,
      },
    })
    .catch(() => undefined);

  if (!rows) {
    return res.status(400).send('發生錯誤');
  }

  const jamData = rows.map((v) => ({ ...v, genre: JSON.parse(v.genre) }));

  res.status(200).json({ genreData, jamData, pageTotal, page });
});

// 已成立樂團的詳細資訊頁
router.get('/singleFormedJam/:juid', async (req, res) => {
  const juid = req.params.juid as string;

  const [genreData, playerData] = await Promise.all([
    prisma.genre.findMany().catch(() => undefined),
    prisma.player.findMany().catch(() => undefined),
  ]);

  const jamRow = await prisma.jam
    .findFirst({
      where: { juid, valid: 1, state: 1 },
      select: {
        juid: true,
        former: true,
        member: true,
        name: true,
        cover_img: true,
        introduce: true,
        works_link: true,
        genre: true,
        region: true,
        formed_time: true,
      },
    })
    .catch(() => undefined);

  if (!jamRow) {
    return res.status(400).json({ status: 'error' });
  }

  let setMember: unknown[] = [];
  if (jamRow.member !== '[]' || jamRow.member) {
    setMember = JSON.parse(jamRow.member);
  }
  const jamData: Record<string, unknown> = {
    ...jamRow,
    member: setMember,
    former: JSON.parse(jamRow.former),
    genre: JSON.parse(jamRow.genre),
  };

  // 發起人資料
  const formerID = (jamData.former as { id: number }).id;
  const formerUser = await prisma.user
    .findUnique({ where: { id: formerID }, select: userSelect })
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  (jamData.former as Record<string, unknown>).play = playerData?.find(
    (v) => v.id === (jamData.former as { play: number }).play
  )?.name;
  jamData.former = {
    ...(jamData.former as object),
    uid: formerUser?.uid,
    name: formerUser?.name,
    img: formerUser?.img,
    nickname: formerUser?.nickname,
  };

  // 成員資料
  const members = jamData.member as { id: number; play: number }[];
  const memberIds = members.map((v) => v.id);
  const memberData = await prisma.user
    .findMany({ where: { id: { in: memberIds } }, select: userSelect })
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  jamData.member = members
    .map((v) => {
      const match = playerData?.find((pv) => pv.id === v.play);
      return { ...v, play: match?.name };
    })
    .map((v) => {
      const match = memberData?.find((mv) => mv.id === v.id);
      return {
        ...v,
        uid: match?.uid,
        name: match?.name,
        img: match?.img,
        nickname: match?.nickname,
      };
    });

  res.status(200).json({ status: 'success', genreData, jamData });
});

// 發起JAM表單
router.post('/form', upload.none(), async (req, res) => {
  const {
    uid,
    title,
    degree,
    genre,
    former,
    players,
    region,
    condition,
    description,
  } = req.body;
  const tureDegree = parseInt(degree);
  const juid = generateUid();
  try {
    // 更新會員所屬的JAM
    await prisma.user.update({
      where: { uid },
      data: { my_jam: juid },
    });
    // 刪除所有該會員的申請
    await prisma.jamApply.updateMany({
      where: { applier_uid: uid },
      data: { valid: 0, state: 4 },
    });
    // 建立JAM
    await prisma.jam.create({
      data: {
        juid,
        title,
        degree: tureDegree,
        genre,
        former,
        players,
        region,
        band_condition: condition,
        description,
      },
    });
    res.status(200).json({ status: 'success', juid });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 申請入團
router.post('/apply', upload.none(), async (req, res) => {
  const { juid, former_uid, applier_uid, applier_play, message } = req.body;
  try {
    await prisma.jamApply.create({
      data: { juid, former_uid, applier_uid, applier_play, message },
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 修改表單
router.put('/updateForm', upload.none(), async (req, res) => {
  const { juid, title, condition, description } = req.body;
  try {
    await prisma.jam.update({
      where: { juid },
      data: {
        title,
        band_condition: condition,
        description,
        updated_time: new Date(),
      },
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error });
  }
});

// 確認入團
router.put('/joinJam', upload.none(), async (req, res) => {
  const { user_id, user_uid, juid, applier_play } = req.body;
  const userId = parseInt(user_id);

  try {
    // 取得原資料
    const jamRow = await prisma.jam.findUnique({
      where: { juid },
      select: { players: true, member: true },
    });
    if (!jamRow) {
      return res.status(404).json({ status: 'error', error: 'JAM not found' });
    }

    // 準備更新樂團member、play欄位的資料
    const newMember = { id: userId, play: parseInt(applier_play) };
    // play
    const players: number[] = JSON.parse(jamRow.players);
    players.splice(players.indexOf(parseInt(applier_play)), 1);
    const playersStr = JSON.stringify(players);
    // member
    const memberArr: object[] = JSON.parse(jamRow.member);
    memberArr.push(newMember);
    const memberStr = JSON.stringify(memberArr);

    // 若players變成空陣列，表示人已招滿，令樂團成立
    let formed = false;
    if (players.length === 0) {
      const defaultName = 'JAM-' + juid;
      await prisma.jam.update({
        where: { juid },
        data: {
          member: memberStr,
          players: playersStr,
          name: defaultName,
          formed_time: new Date(),
          state: 1,
        },
      });
      formed = true;
    } else {
      await prisma.jam.update({
        where: { juid },
        data: { member: memberStr, players: playersStr },
      });
    }

    // 更新所有申請: 刪除狀態(valid=0, state=4)
    await prisma.jamApply.updateMany({
      where: { applier_uid: user_uid },
      data: { state: 4, valid: 0 },
    });

    // 更新會員my_jam欄位
    await prisma.user.update({
      where: { id: userId },
      data: { my_jam: juid },
    });

    res.status(200).json({ status: formed ? 'form_success' : 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 取消申請
router.put('/cancelApply', upload.none(), async (req, res) => {
  const { id } = req.body;
  try {
    await prisma.jamApply.update({
      where: { id: parseInt(id) },
      data: { state: 3, valid: 0 },
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 刪除申請
router.put('/deleteApply', upload.none(), async (req, res) => {
  const { id } = req.body;
  try {
    await prisma.jamApply.update({
      where: { id: parseInt(id) },
      data: { state: 4, valid: 0 },
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 拒絕or接受申請
router.put('/decideApply', upload.none(), async (req, res) => {
  const { id, state } = req.body;
  try {
    // 檢查該申請是否已經取消
    const cancelled = await prisma.jamApply.findFirst({
      where: { id: parseInt(id), valid: 0 },
      select: { id: true },
    });
    if (cancelled) {
      return res.status(200).json({ status: 'cancel' });
    }
    // 更新申請狀態
    await prisma.jamApply.update({
      where: { id: parseInt(id) },
      data: { state: parseInt(state) },
    });
    res.status(200).json({ status: 'success', state: parseInt(state) });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 解散樂團
router.put('/disband', upload.none(), async (req, res) => {
  const { juid, ids } = req.body;
  try {
    await prisma.jam.update({
      where: { juid },
      data: { valid: 0 },
    });
    const uidList: string[] = JSON.parse(ids);
    await prisma.user.updateMany({
      where: { uid: { in: uidList } },
      data: { my_jam: null },
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error' });
  }
});

// 退出樂團
router.put('/quit', upload.none(), async (req, res) => {
  const { id, juid, playname } = req.body;
  const user_id = parseInt(id);

  try {
    // 取得樂手資料，比對名稱以獲得編號，復原jam的players
    const playerData = await prisma.player.findMany();
    const playID = playerData.find((v) => v.name === playname)?.id;
    if (playID === undefined) {
      return res
        .status(400)
        .json({ status: 'error', error: 'player not found' });
    }

    // 取得jam原資料
    const jamRow = await prisma.jam.findUnique({
      where: { juid },
      select: { member: true, players: true },
    });
    if (!jamRow) {
      return res.status(404).json({ status: 'error', error: 'JAM not found' });
    }

    // play
    const players: number[] = JSON.parse(jamRow.players);
    players.push(playID);
    // member
    const memberArr: { id: number; play: number }[] = JSON.parse(jamRow.member);
    const newMember = memberArr.filter((v) => v.id !== user_id);

    await prisma.jam.update({
      where: { juid },
      data: {
        member: JSON.stringify(newMember),
        players: JSON.stringify(players),
        updated_time: new Date(),
      },
    });

    // 更新會員my_jam欄位
    await prisma.user.update({
      where: { id: user_id },
      data: { my_jam: null },
    });

    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 立即成團
router.put('/formRightNow', upload.none(), async (req, res) => {
  const { juid } = req.body;
  try {
    const defaultName = 'JAM-' + juid;
    await prisma.jam.update({
      where: { juid },
      data: { state: 1, formed_time: new Date(), name: defaultName },
    });
    // 刪除所有所屬的申請
    await prisma.jamApply.updateMany({
      where: { juid },
      data: { state: 4, valid: 0 },
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// 編輯資訊
router.put('/editInfo', upload.single('cover_img'), async (req, res) => {
  const { juid, bandName, introduce, works_link } = req.body;
  try {
    const updateData: Record<string, unknown> = {
      name: bandName,
      introduce,
      works_link,
      updated_time: new Date(),
    };
    if (req.file) {
      const newCover = Date.now() + extname(req.file.originalname);
      await rename(
        req.file.path,
        resolve(__dirname, 'public/jam', newCover)
      ).catch((error) => console.error('更名失敗' + error));
      updateData.cover_img = newCover;
    }
    await prisma.jam.update({
      where: { juid },
      data: updateData,
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

function generateUid() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = 12;
  const createdCodes = [];
  let createCodes = '';

  let Code = '';
  do {
    Code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      Code += characters.charAt(randomIndex);
    }
  } while (createdCodes.includes(Code));

  createdCodes.push(Code);
  createCodes += Code;
  return createCodes;
}

export default router;
