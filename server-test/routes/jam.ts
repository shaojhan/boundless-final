import express from 'express';
import db from '#db';
import prisma from '#configs/prisma.js';
import multer from 'multer';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { rename } from 'fs/promises';

const router = express.Router();
const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
const upload = multer({ dest: resolve(__dirname, 'public') });
// 取得所有組團資料
router.get('/allJam', async (req, res) => {
  // 取得組團資訊中所需的曲風、樂手資料
  const [genreData] = await db
    .execute('SELECT * FROM `genre`')
    .catch((error) => {
      console.error(error);
      return undefined;
    });
  const [playerData] = await db.execute('SELECT * FROM `player`').catch(() => {
    return undefined;
  });

  // 取得目前時間，應對資料庫中儲存的資料，使用ISO格式
  const now = new Date().toISOString();

  // 取得資料總筆數，用於製作分頁，招募中state = 0
  let [dataCount] = await db
    .execute(
      'SELECT * FROM `jam` WHERE `valid` = 1 AND DATE_ADD(`created_time`, INTERVAL 30 DAY) > ? AND `state` = 0',
      [now]
    )
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  let page = Number(req.query.page) || 1; // 目前頁碼
  let dataPerpage = 10; // 每頁 10 筆
  let offset = (page - 1) * dataPerpage; // 取得下一批資料
  let pageTotal = Math.ceil(dataCount.length / dataPerpage); // 計算總頁數
  let pageString = ' LIMIT ' + offset + ',' + dataPerpage;

  // 排序用
  const orderDirection = req.query.order || 'ASC';

  let data;
  if (Object.keys(req.query).length !== 0) {
    // 所有篩選條件，預設條件: valid=1(未解散)、state=0(發起中)、時間未過期
    let sqlString =
      "SELECT * FROM `jam` WHERE `valid` = 1 AND `state` = 0 AND DATE_ADD(`created_time`, INTERVAL 30 DAY) > '" +
      now +
      "'";
    const degree =
      req.query.degree !== 'all'
        ? ' AND `degree` = ' + parseInt(String(req.query.degree))
        : '';
    // genere 和 player 儲存的是字串，需使用 LIKE 語法，而非 FIND_IN_SET('1', `genere`)
    const genre =
      req.query.genre !== 'all'
        ? " AND (`genre` LIKE '%," +
          req.query.genre +
          "]'" +
          " OR `genre` LIKE '[" +
          req.query.genre +
          ",%'" +
          " OR `genre` LIKE '%," +
          req.query.genre +
          ",%'" +
          " OR `genre` = '[" +
          req.query.genre +
          "]')"
        : '';
    const player =
      req.query.player !== 'all'
        ? " AND (`players` LIKE '%," +
          req.query.player +
          "]'" +
          " OR `players` LIKE '[" +
          req.query.player +
          ",%'" +
          " OR `players` LIKE '%," +
          req.query.player +
          ",%'" +
          " OR `players` = '[" +
          req.query.player +
          "]')"
        : '';
    const region =
      req.query.region !== 'all'
        ? " AND `region` = '" + req.query.region + "'"
        : '';

    sqlString +=
      degree +
      genre +
      player +
      region +
      ' ORDER BY `created_time` ' +
      orderDirection;
    [dataCount] = await db.execute(sqlString).catch(() => {
      return undefined;
    });

    page = Number(req.query.page) || 1; // 目前頁碼
    dataPerpage = 10; // 每頁 10 筆
    offset = (page - 1) * dataPerpage; // 取得下一批資料
    pageTotal = Math.ceil(dataCount.length / dataPerpage); // 計算總頁數
    pageString = ' LIMIT ' + offset + ',' + dataPerpage;

    sqlString += pageString;
    [data] = await db.execute(sqlString).catch(() => {
      return undefined;
    });
  } else {
    // 沒有篩選條件
    [data] = await db
      .execute(
        'SELECT * FROM `jam` WHERE `valid` = 1 AND DATE_ADD(`created_time`, INTERVAL 30 DAY) > ? AND `state` = 0 ORDER BY `created_time` ASC LIMIT 0, 10',
        [now]
      )
      .catch(() => {
        return undefined;
      });
  }

  if (data && data != undefined) {
    // 整理資料，把字串轉成陣列或物件
    const jamData = data.map((v) => {
      // member可能為空值，先令其為空陣列
      let setMember = [];
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

    // 搜尋對應的發起人資料
    let formerSql =
      'SELECT `id`, `uid`, `name`, `img`, `nickname` FROM `user` WHERE `id` IN ';
    let formerID = '';
    jamData.forEach((v, i) => {
      if (i < jamData.length - 1) {
        formerID += v.former.id + ',';
      } else {
        formerID += v.former.id;
      }
    });
    formerSql += `(${formerID})`;
    const [formerData] = await db.execute(formerSql).catch(() => {
      return [];
    });

    res.status(200).json({
      genreData,
      playerData,
      jamData,
      formerData,
      pageTotal,
      page,
    });
  } else {
    res.status(400).send('發生錯誤');
  }
});

// 組團資訊頁，獲得單筆資料
router.get('/singleJam/:juid{/:uid}', async (req, res) => {
  const juid = req.params.juid;
  // 檢查該樂團是否已經成團，條件: 未解散(valid=1)，已成團(state=1)
  const [checkFormed] = await db
    .execute(
      'SELECT * FROM `jam` WHERE `juid` = ? AND `valid` = 1 AND `state` = 1',
      [juid]
    )
    .catch(() => {
      return undefined;
    });
  if (checkFormed.length > 0) {
    res.status(200).json({ status: 'formed' });
    return;
  }

  let myApplyState = [];
  // 檢查訪問的使用者是否有申請此樂團，並獲得其狀態
  const paramsUid = (req.params as Record<string, string>).uid;
  if (paramsUid) {
    const uid = paramsUid;
    [myApplyState] = await db
      .execute(
        'SELECT `state` FROM `jam_apply` WHERE `applier_uid` = ? AND `juid` = ?',
        [uid, juid]
      )
      .catch(() => {
        return undefined;
      });
  }

  // -------------------------------------- 取得組團資訊中所需的曲風、樂手資料 --------------------------------------
  const [genreData] = await db.execute('SELECT * FROM `genre`').catch(() => {
    return undefined;
  });
  const [playerData] = await db.execute('SELECT * FROM `player`').catch(() => {
    return undefined;
  });

  // 取得目前時間，應對資料庫中儲存的資料，使用ISO格式
  const now = new Date().toISOString();

  const [data] = await db
    .execute(
      'SELECT * FROM `jam` WHERE `juid` = ? AND `valid` = 1 AND DATE_ADD(`created_time`, INTERVAL 30 DAY) > ?',
      [juid, now]
    )
    .catch(() => {
      return undefined;
    });
  if (data && data.length > 0) {
    const trueData = data[0];
    let setMember = [];
    if (trueData.member !== '[]' || trueData.member) {
      setMember = JSON.parse(trueData.member);
    }
    const jamData = {
      ...trueData,
      member: setMember,
      former: JSON.parse(trueData.former),
      player: JSON.parse(trueData.players),
      genre: JSON.parse(trueData.genre),
    };

    // -------------------------------------- 撈取該樂團的申請資料 --------------------------------------
    // valid=1 未取消
    let [applyData] = await db
      .execute('SELECT * FROM `jam_apply` WHERE `valid` = 1 AND `juid` = ?', [
        juid,
      ])
      .catch(() => {
        return [];
      });

    // -------------------------------------- 若存在申請資料，進行資料整理
    if (applyData.length > 0) {
      applyData = applyData.map((v) => {
        const createdDate = new Date(v.created_time)
          .toLocaleString()
          .split(' ')[0]
          .replace(/\//g, '-');
        return {
          ...v,
          created_time: createdDate,
        };
      });
      applyData = applyData.map((v) => {
        const matchPlay = playerData.find((pv) => {
          return pv.id === v.applier_play;
        }).name;
        return {
          ...v,
          play: matchPlay,
        };
      });
      // -------------------------------------- 合併對應的會員資料
      let appliersID = '';
      let appliersSql =
        'SELECT `id`, `uid`, `name`, `img`, `nickname` FROM `user` WHERE `uid` IN ';
      applyData.map((v, i) => {
        if (i < applyData.length - 1) {
          appliersID += "'" + v.applier_uid + "',";
        } else {
          appliersID += "'" + v.applier_uid + "'";
        }
      });
      appliersSql += `(${appliersID})`;
      const [appliers] = await db.execute(appliersSql).catch(() => {
        return undefined;
      });
      applyData = applyData.map((v) => {
        const matchUser = appliers.find((av) => {
          return av.uid === v.applier_uid;
        });
        return {
          ...v,
          applier: matchUser,
        };
      });
    }

    // -------------------------------------- 撈取對應的發起人&成員資料 --------------------------------------
    const formerID = jamData.former.id;
    const [formerData] = await db
      .execute(
        'SELECT `id`, `uid`, `name`, `img`, `nickname` FROM `user` WHERE `id` = ? ',
        [formerID]
      )
      .catch(() => {
        return undefined;
      });
    // ------------------------------------------ 合併資料
    // former {id, play}
    // play對應樂器
    jamData.former.play = playerData.find((v) => {
      return v.id === jamData.former.play;
    }).name;
    // id對應會員資料
    jamData.former = {
      ...jamData.former,
      uid: formerData[0].uid,
      name: formerData[0].name,
      img: formerData[0].img,
      nickname: formerData[0].nickname,
    };

    // -------------------------------------- 成員資料
    // 若有成員
    if (jamData.member.length > 0) {
      let membersID = '';
      let memberSql =
        'SELECT `id`, `uid`, `name`, `img`, `nickname` FROM `user` WHERE `id` IN ';
      jamData.member.forEach((v, i) => {
        if (i < jamData.member.length - 1) {
          membersID += v.id + ',';
        } else {
          membersID += v.id;
        }
      });
      memberSql += `(${membersID})`;
      const [memberData] = await db.execute(memberSql).catch(() => {
        return undefined;
      });
      // ------------------------------------------ 合併資料
      // play對應樂器
      jamData.member = jamData.member.map((v) => {
        const match = playerData.find((pv) => {
          return pv.id === v.play;
        });
        return { ...v, play: match.name };
      });
      // id對應會員資料
      jamData.member = jamData.member.map((v) => {
        const match = memberData.find((mv) => {
          return mv.id === v.id;
        });
        return {
          ...v,
          uid: match.uid,
          name: match.name,
          img: match.img,
          nickname: match.nickname,
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
  } else {
    res.status(400).json({ status: 'error' });
  }
});

// 取得會員中心的樂團申請一覽
router.get('/getMyApply/:uid', async (req, res) => {
  const uid = req.params.uid;
  const [datas] = await db
    .execute(
      'SELECT jam_apply.*, jam.title FROM `jam_apply` JOIN `jam` ON jam.juid = jam_apply.juid WHERE jam_apply.valid = 1 AND jam_apply.applier_uid = ? ',
      [uid]
    )
    .catch((error) => {
      console.error(error);
      return undefined;
    });
  if (datas && datas.length > 0) {
    const now = new Date().toISOString();
    const [playerData] = await db
      .execute('SELECT * FROM `player`')
      .catch(() => {
        return undefined;
      });

    let data = datas.map((v) => {
      const match = playerData.find((pv) => {
        return pv.id === v.applier_play;
      }).name;
      return { ...v, applier_playname: match };
    });

    // 過濾解散、已成團、發起失敗(過期)的jam
    let allJuid = '';
    let allJuidSql =
      "SELECT `juid` FROM `jam` WHERE `valid` = 0 AND `state` = 1 AND DATE_ADD(`created_time`, INTERVAL 30 DAY) < '" +
      now +
      "' AND `juid` IN ";
    data.forEach((v, i) => {
      if (i < data.length - 1) {
        allJuid += "'" + v.juid + "',";
      } else {
        allJuid += "'" + v.juid + "'";
      }
    });
    allJuidSql += `(${allJuid})`;
    const [jamExist] = await db.execute(allJuidSql).catch(() => {
      return undefined;
    });
    if (jamExist && jamExist.length > 0) {
      data = data.filter((v) => {
        return !jamExist.includes(v.juid);
      });
    }
    res.status(200).json({ status: 'success', data });
  } else {
    res.status(400).json({ status: 'error' });
  }
});

// 取得所有已成立的樂團資料
router.get('/allFormedJam', async (req, res) => {
  // 取得組團資訊中所需的曲風資料
  const [genreData] = await db
    .execute('SELECT * FROM `genre`')
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  // 取得資料總筆數，用於製作分頁，招募完成state = 1
  let [dataCount] = await db
    .execute('SELECT * FROM `jam` WHERE `valid` = 1 AND `state` = 1')
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  let page = Number(req.query.page) || 1; // 目前頁碼
  let dataPerpage = 10; // 每頁 10 筆
  let offset = (page - 1) * dataPerpage; // 取得下一批資料
  let pageTotal = Math.ceil(dataCount.length / dataPerpage); // 計算總頁數
  let pageString = ' LIMIT ' + offset + ',' + dataPerpage;

  // 排序用
  const orderDirection = req.query.order || 'ASC';

  let data;
  if (Object.keys(req.query).length !== 0) {
    // 所有篩選條件，預設條件: valid=1(未解散)、state=0(發起中)、時間未過期
    let sqlString = 'SELECT * FROM `jam` WHERE `valid` = 1 AND `state` = 1';
    // 解譯編碼
    const decoded = decodeURIComponent(String(req.query.search));
    const search = decoded !== '' ? " AND `name` LIKE '%" + decoded + "%'" : '';
    // genere儲存的是字串，需使用 LIKE 語法，而非 FIND_IN_SET('1', `genere`)
    const genre =
      req.query.genre !== 'all'
        ? " AND (`genre` LIKE '%," +
          req.query.genre +
          "]'" +
          " OR `genre` LIKE '[" +
          req.query.genre +
          ",%'" +
          " OR `genre` LIKE '%," +
          req.query.genre +
          ",%'" +
          " OR `genre` = '[" +
          req.query.genre +
          "]')"
        : '';
    const region =
      req.query.region !== 'all'
        ? " AND `region` = '" + req.query.region + "'"
        : '';

    sqlString +=
      search + genre + region + ' ORDER BY `formed_time` ' + orderDirection;
    [dataCount] = await db.execute(sqlString).catch(() => {
      return undefined;
    });

    page = Number(req.query.page) || 1; // 目前頁碼
    dataPerpage = 10; // 每頁 10 筆
    offset = (page - 1) * dataPerpage; // 取得下一批資料
    pageTotal = Math.ceil(dataCount.length / dataPerpage); // 計算總頁數
    pageString = ' LIMIT ' + offset + ',' + dataPerpage;

    sqlString += pageString;
    [data] = await db.execute(sqlString).catch(() => {
      return undefined;
    });
  } else {
    // 沒有篩選條件
    [data] = await db
      .execute(
        'SELECT `juid`, `name`, `cover_img`, `genre`, `formed_time`, `region` FROM `jam` WHERE `valid` = 1 AND `state` = 1 ORDER BY `formed_time` ASC LIMIT 0, 10'
      )
      .catch(() => {
        return undefined;
      });
  }

  if (data && data != undefined) {
    // 整理資料，把字串轉成陣列或物件
    const jamData = data.map((v) => {
      return {
        ...v,
        genre: JSON.parse(v.genre),
      };
    });

    res.status(200).json({
      genreData,
      jamData,
      pageTotal,
      page,
    });
  } else {
    res.status(400).send('發生錯誤');
  }
});

// 已成立樂團的詳細資訊頁
router.get('/singleFormedJam/:juid', async (req, res) => {
  const juid = req.params.juid;
  // -------------------------------------- 取得組團資訊中所需的曲風、樂手資料 --------------------------------------
  const [genreData] = await db.execute('SELECT * FROM `genre`').catch(() => {
    return undefined;
  });
  const [playerData] = await db.execute('SELECT * FROM `player`').catch(() => {
    return undefined;
  });

  const [data] = await db
    .execute(
      'SELECT `juid`, `former`, `member`, `name`, `cover_img`, `introduce`, `works_link`, `genre`, `region`, `formed_time` FROM `jam` WHERE `juid` = ? AND `valid` = 1 AND `state` = 1',
      [juid]
    )
    .catch(() => {
      return undefined;
    });
  if (data && data.length > 0) {
    const trueData = data[0];
    let setMember = [];
    if (trueData.member !== '[]' || trueData.member) {
      setMember = JSON.parse(trueData.member);
    }
    const jamData = {
      ...trueData,
      member: setMember,
      former: JSON.parse(trueData.former),
      genre: JSON.parse(trueData.genre),
    };

    // -------------------------------------- 撈取對應的發起人&成員資料 --------------------------------------
    const formerID = jamData.former.id;
    const [formerData] = await db
      .execute(
        'SELECT `id`, `uid`, `name`, `img`, `nickname` FROM `user` WHERE `id` = ? ',
        [formerID]
      )
      .catch(() => {
        return undefined;
      });
    // ------------------------------------------ 合併資料 (former)
    // former {id, play}
    // play對應樂器
    jamData.former.play = playerData.find((v) => {
      return v.id === jamData.former.play;
    }).name;
    // id對應會員資料
    jamData.former = {
      ...jamData.former,
      uid: formerData[0].uid,
      name: formerData[0].name,
      img: formerData[0].img,
      nickname: formerData[0].nickname,
    };

    // -------------------------------------- 成員資料
    let membersID = '';
    let memberSql =
      'SELECT `id`, `uid`, `name`, `img`, `nickname` FROM `user` WHERE `id` IN ';
    jamData.member.forEach((v, i) => {
      if (i < jamData.member.length - 1) {
        membersID += v.id + ',';
      } else {
        membersID += v.id;
      }
    });
    memberSql += `(${membersID})`;
    const [memberData] = await db.execute(memberSql).catch((error) => {
      console.error(error);
      return undefined;
    });
    // ------------------------------------------ 合併資料 (member)
    // play對應樂器
    jamData.member = jamData.member.map((v) => {
      const match = playerData.find((pv) => {
        return pv.id === v.play;
      });
      return { ...v, play: match.name };
    });
    // id對應會員資料
    jamData.member = jamData.member.map((v) => {
      const match = memberData.find((mv) => {
        return mv.id === v.id;
      });
      return {
        ...v,
        uid: match.uid,
        name: match.name,
        img: match.img,
        nickname: match.nickname,
      };
    });

    res.status(200).json({
      status: 'success',
      genreData,
      jamData,
    });
  } else {
    res.status(400).json({ status: 'error' });
  }
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
    const [playerRows] = await db.execute('SELECT * FROM `player`');
    const playerData = playerRows as { id: number; name: string }[];
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
      //   回傳characters當中的隨機一值
      Code += characters.charAt(randomIndex);
    }
  } while (createdCodes.includes(Code));

  createdCodes.push(Code);
  createCodes += Code;
  return createCodes;
}

export default router;
