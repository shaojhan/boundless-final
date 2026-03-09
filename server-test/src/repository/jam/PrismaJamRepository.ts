import type { PrismaClient } from '#generated/prisma/client.js';
import type { IJamRepository } from './IJamRepository.js';
import type {
  GenreItem,
  PlayerItem,
  JamFindOptions,
  JamListResult,
  JamListRow,
  JamDetailResult,
  JamApplyEnriched,
  MyApplyItem,
  FormedJamFindOptions,
  FormedJamListResult,
  FormedJamDetailResult,
  UserProfile,
  CreateJamInput,
  CreateApplyInput,
  UpdateJamFormInput,
  EditJamInfoInput,
} from '../../domain/jam/Jam.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** 30-day expiry window for recruitment posts */
function jamExpiry(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

/**
 * Prisma string filter for JSON-array fields stored as "[1,2,3]".
 * Matches entries where the given value appears as an element.
 */
function jsonArrayFilter(value: string) {
  return {
    OR: [
      { endsWith: `,${value}]` },
      { startsWith: `[${value},` },
      { contains: `,${value},` },
      { equals: `[${value}]` },
    ],
  };
}

const userSelect = {
  id: true,
  uid: true,
  name: true,
  img: true,
  nickname: true,
} as const;

// ── Repository ────────────────────────────────────────────────────────────────

export class PrismaJamRepository implements IJamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── GET /allJam ─────────────────────────────────────────────────────────────

  async findJams(opts: JamFindOptions): Promise<JamListResult> {
    const [genreData, playerData] = await Promise.all([
      this.prisma.genre.findMany() as Promise<GenreItem[]>,
      this.prisma.player.findMany() as Promise<PlayerItem[]>,
    ]);

    const expiry = jamExpiry();
    const orderDirection: 'asc' | 'desc' = opts.order ?? 'asc';
    const page = opts.page ?? 1;
    const dataPerpage = 10;

    const where: Record<string, unknown> = {
      valid: 1,
      state: 0,
      created_time: { gt: expiry },
    };
    if (opts.degree !== undefined) {
      where.degree = opts.degree;
    }
    if (opts.genre && opts.genre !== 'all') {
      where.genre = jsonArrayFilter(opts.genre);
    }
    if (opts.player && opts.player !== 'all') {
      where.players = jsonArrayFilter(opts.player);
    }
    if (opts.region && opts.region !== 'all') {
      where.region = opts.region;
    }

    const totalCount = await this.prisma.jam.count({ where });
    const pageTotal = Math.ceil(totalCount / dataPerpage);
    const offset = (page - 1) * dataPerpage;

    const rows = await this.prisma.jam
      .findMany({
        where,
        orderBy: { created_time: orderDirection },
        take: dataPerpage,
        skip: offset,
      })
      .catch(() => undefined);

    if (!rows) {
      return { genreData, playerData, jamData: [], formerData: [], pageTotal: 0, page };
    }

    const jamData: JamListRow[] = rows.map((v) => ({
      id: v.id,
      juid: v.juid,
      former: JSON.parse(v.former),
      member: v.member ? JSON.parse(v.member) : [],
      name: v.name,
      title: v.title,
      description: v.description,
      degree: v.degree,
      genre: JSON.parse(v.genre),
      player: JSON.parse(v.players),
      region: v.region,
      band_condition: v.band_condition,
      created_time: v.created_time,
      updated_time: v.updated_time,
      state: v.state,
      valid: v.valid,
    }));

    const formerIds = jamData.map((v) => (v.former as { id: number }).id);
    const formerData = (await this.prisma.user.findMany({
      where: { id: { in: formerIds } },
      select: userSelect,
    })) as UserProfile[];

    return { genreData, playerData, jamData, formerData, pageTotal, page };
  }

  // ── GET /singleJam/:juid/:uid? ──────────────────────────────────────────────

  async findJamByJuid(juid: string, uid?: string): Promise<JamDetailResult> {
    const checkFormed = await this.prisma.jam
      .findFirst({ where: { juid, valid: 1, state: 1 } })
      .catch(() => undefined);
    if (checkFormed) {
      return { status: 'formed' };
    }

    let myApplyState: Array<{ state: number }> = [];
    if (uid) {
      myApplyState = await this.prisma.jamApply
        .findMany({
          where: { applier_uid: uid, juid },
          select: { state: true },
        })
        .catch(() => []);
    }

    const [genreData, playerData] = await Promise.all([
      this.prisma.genre.findMany().catch(() => undefined) as Promise<GenreItem[] | undefined>,
      this.prisma.player.findMany().catch(() => undefined) as Promise<PlayerItem[] | undefined>,
    ]);

    const expiry = jamExpiry();
    const jamRow = await this.prisma.jam
      .findFirst({ where: { juid, valid: 1, created_time: { gt: expiry } } })
      .catch(() => undefined);

    if (!jamRow) {
      return { status: 'error' };
    }

    const jamData: Record<string, unknown> = {
      ...jamRow,
      member: jamRow.member ? JSON.parse(jamRow.member) : [],
      former: JSON.parse(jamRow.former),
      player: JSON.parse(jamRow.players),
      genre: JSON.parse(jamRow.genre),
    };

    // Enrich applies
    let applyRows = await this.prisma.jamApply
      .findMany({ where: { valid: 1, juid } })
      .catch(() => []);

    let applyData: JamApplyEnriched[] = [];
    if (applyRows.length > 0) {
      const enrichedApplies = applyRows.map((v) => {
        const createdDate = new Date(v.created_time)
          .toLocaleString()
          .split(' ')[0]
          .replace(/\//g, '-');
        return { ...v, created_time: createdDate };
      });

      const withPlay = enrichedApplies.map((v) => {
        const matchPlay = playerData?.find((pv) => pv.id === v.applier_play)?.name;
        return { ...v, play: matchPlay };
      });

      const applierUids = applyRows.map((v) => v.applier_uid);
      const appliers = await this.prisma.user
        .findMany({ where: { uid: { in: applierUids } }, select: userSelect })
        .catch(() => undefined);

      applyData = withPlay.map((v) => {
        const matchUser = appliers?.find((av) => av.uid === v.applier_uid);
        return { ...v, applier: matchUser as UserProfile | undefined } as JamApplyEnriched;
      });
    }

    // Enrich former
    const formerID = (jamData.former as { id: number }).id;
    const formerUser = await this.prisma.user
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

    // Enrich members
    const members = jamData.member as { id: number; play: number }[];
    if (members.length > 0) {
      const memberIds = members.map((v) => v.id);
      const memberData = await this.prisma.user
        .findMany({ where: { id: { in: memberIds } }, select: userSelect })
        .catch(() => undefined);

      jamData.member = members
        .map((v) => {
          const match = playerData?.find((pv) => pv.id === v.play);
          return { ...v, play: match?.name };
        })
        .map((v) => {
          const match = memberData?.find((mv) => mv.id === (v as any).id);
          return {
            ...v,
            uid: match?.uid,
            name: match?.name,
            img: match?.img,
            nickname: match?.nickname,
          };
        });
    }

    return { status: 'success', genreData, playerData, jamData, applyData, myApplyState };
  }

  // ── GET /getMyApply/:uid ────────────────────────────────────────────────────

  async findMyApplies(uid: string): Promise<MyApplyItem[] | null> {
    const applyRows = await this.prisma.jamApply
      .findMany({
        where: { valid: 1, applier_uid: uid },
        include: { jam: { select: { title: true } } },
      })
      .catch((error) => {
        console.error(error);
        return undefined;
      });

    if (!applyRows || applyRows.length === 0) {
      return null;
    }

    const playerData = await this.prisma.player.findMany().catch(() => undefined);

    let data: MyApplyItem[] = applyRows.map((v) => {
      const { jam, ...applyFields } = v;
      const match = playerData?.find((pv) => pv.id === applyFields.applier_play)?.name;
      return { ...applyFields, title: jam.title, applier_playname: match };
    });

    // Filter out disbanded / formed / expired jams
    const expiry = jamExpiry();
    const allJuids = data.map((v) => v.juid);
    const invalidJams = await this.prisma.jam
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

    return data;
  }

  // ── GET /allFormedJam ───────────────────────────────────────────────────────

  async findFormedJams(opts: FormedJamFindOptions): Promise<FormedJamListResult> {
    const genreData = await this.prisma.genre.findMany().catch((error) => {
      console.error(error);
      return undefined;
    }) as GenreItem[] | undefined;

    const orderDirection: 'asc' | 'desc' = opts.order ?? 'asc';
    const page = opts.page ?? 1;
    const dataPerpage = 10;

    const where: Record<string, unknown> = { valid: 1, state: 1 };
    if (opts.search) {
      where.name = { contains: decodeURIComponent(opts.search) };
    }
    if (opts.genre && opts.genre !== 'all') {
      where.genre = jsonArrayFilter(opts.genre);
    }
    if (opts.region && opts.region !== 'all') {
      where.region = opts.region;
    }

    const totalCount = await this.prisma.jam.count({ where });
    const pageTotal = Math.ceil(totalCount / dataPerpage);
    const offset = (page - 1) * dataPerpage;

    const rows = await this.prisma.jam
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
      return { genreData, jamData: [], pageTotal: 0, page };
    }

    const jamData = rows.map((v) => ({ ...v, genre: JSON.parse(v.genre) }));
    return { genreData, jamData, pageTotal, page };
  }

  // ── GET /singleFormedJam/:juid ──────────────────────────────────────────────

  async findFormedJamByJuid(juid: string): Promise<FormedJamDetailResult> {
    const [genreData, playerData] = await Promise.all([
      this.prisma.genre.findMany().catch(() => undefined) as Promise<GenreItem[] | undefined>,
      this.prisma.player.findMany().catch(() => undefined) as Promise<PlayerItem[] | undefined>,
    ]);

    const jamRow = await this.prisma.jam
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
      return { status: 'error' };
    }

    const jamData: Record<string, unknown> = {
      ...jamRow,
      member: jamRow.member ? JSON.parse(jamRow.member) : [],
      former: JSON.parse(jamRow.former),
      genre: JSON.parse(jamRow.genre),
    };

    // Enrich former
    const formerID = (jamData.former as { id: number }).id;
    const formerUser = await this.prisma.user
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

    // Enrich members
    const members = jamData.member as { id: number; play: number }[];
    const memberIds = members.map((v) => v.id);
    const memberData = await this.prisma.user
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
        const match = memberData?.find((mv) => mv.id === (v as any).id);
        return {
          ...v,
          uid: match?.uid,
          name: match?.name,
          img: match?.img,
          nickname: match?.nickname,
        };
      });

    return { status: 'success', genreData, jamData };
  }

  // ── POST /form ──────────────────────────────────────────────────────────────

  async createJam(juid: string, data: CreateJamInput): Promise<void> {
    // Update user's my_jam field
    await this.prisma.user.update({
      where: { uid: data.uid },
      data: { my_jam: juid },
    });
    // Invalidate all the user's existing applies
    await this.prisma.jamApply.updateMany({
      where: { applier_uid: data.uid },
      data: { valid: 0, state: 4 },
    });
    // Create the JAM
    await this.prisma.jam.create({
      data: {
        juid,
        title: data.title,
        degree: data.degree,
        genre: data.genre,
        former: data.former,
        players: data.players,
        region: data.region,
        band_condition: data.band_condition,
        description: data.description,
      },
    });
  }

  // ── POST /apply ─────────────────────────────────────────────────────────────

  async createApply(data: CreateApplyInput): Promise<void> {
    await this.prisma.jamApply.create({
      data: {
        juid: data.juid,
        former_uid: data.former_uid,
        applier_uid: data.applier_uid,
        applier_play: data.applier_play,
        message: data.message,
      },
    });
  }

  // ── PUT /updateForm ─────────────────────────────────────────────────────────

  async updateJamForm(juid: string, data: UpdateJamFormInput): Promise<void> {
    await this.prisma.jam.update({
      where: { juid },
      data: {
        title: data.title,
        band_condition: data.condition,
        description: data.description,
        updated_time: new Date(),
      },
    });
  }

  // ── PUT /joinJam ────────────────────────────────────────────────────────────

  async joinJam(
    userId: number,
    userUid: string,
    juid: string,
    applierPlay: number
  ): Promise<'form_success' | 'success'> {
    const jamRow = await this.prisma.jam.findUnique({
      where: { juid },
      select: { players: true, member: true },
    });
    if (!jamRow) {
      throw new Error('JAM not found');
    }

    const newMember = { id: userId, play: applierPlay };
    const players: number[] = JSON.parse(jamRow.players);
    players.splice(players.indexOf(applierPlay), 1);
    const playersStr = JSON.stringify(players);
    const memberArr: object[] = JSON.parse(jamRow.member ?? '[]');
    memberArr.push(newMember);
    const memberStr = JSON.stringify(memberArr);

    let formed = false;
    if (players.length === 0) {
      const defaultName = 'JAM-' + juid;
      await this.prisma.jam.update({
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
      await this.prisma.jam.update({
        where: { juid },
        data: { member: memberStr, players: playersStr },
      });
    }

    await this.prisma.jamApply.updateMany({
      where: { applier_uid: userUid },
      data: { state: 4, valid: 0 },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { my_jam: juid },
    });

    return formed ? 'form_success' : 'success';
  }

  // ── PUT /cancelApply ────────────────────────────────────────────────────────

  async cancelApply(id: number): Promise<void> {
    await this.prisma.jamApply.update({
      where: { id },
      data: { state: 3, valid: 0 },
    });
  }

  // ── PUT /deleteApply ────────────────────────────────────────────────────────

  async deleteApply(id: number): Promise<void> {
    await this.prisma.jamApply.update({
      where: { id },
      data: { state: 4, valid: 0 },
    });
  }

  // ── PUT /decideApply ────────────────────────────────────────────────────────

  async decideApply(id: number, state: number): Promise<'cancel' | 'success'> {
    const cancelled = await this.prisma.jamApply.findFirst({
      where: { id, valid: 0 },
      select: { id: true },
    });
    if (cancelled) {
      return 'cancel';
    }
    await this.prisma.jamApply.update({
      where: { id },
      data: { state },
    });
    return 'success';
  }

  // ── PUT /disband ────────────────────────────────────────────────────────────

  async disbandJam(juid: string, memberUids: string[]): Promise<void> {
    await this.prisma.jam.update({
      where: { juid },
      data: { valid: 0 },
    });
    await this.prisma.user.updateMany({
      where: { uid: { in: memberUids } },
      data: { my_jam: null },
    });
  }

  // ── PUT /quit ───────────────────────────────────────────────────────────────

  async quitJam(userId: number, juid: string, playname: string): Promise<void> {
    const playerData = await this.prisma.player.findMany();
    const playID = playerData.find((v) => v.name === playname)?.id;
    if (playID === undefined) {
      throw new Error('player not found');
    }

    const jamRow = await this.prisma.jam.findUnique({
      where: { juid },
      select: { member: true, players: true },
    });
    if (!jamRow) {
      throw new Error('JAM not found');
    }

    const players: number[] = JSON.parse(jamRow.players);
    players.push(playID);
    const memberArr: { id: number; play: number }[] = JSON.parse(jamRow.member ?? '[]');
    const newMember = memberArr.filter((v) => v.id !== userId);

    await this.prisma.jam.update({
      where: { juid },
      data: {
        member: JSON.stringify(newMember),
        players: JSON.stringify(players),
        updated_time: new Date(),
      },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { my_jam: null },
    });
  }

  // ── PUT /formRightNow ───────────────────────────────────────────────────────

  async formJamNow(juid: string): Promise<void> {
    const defaultName = 'JAM-' + juid;
    await this.prisma.jam.update({
      where: { juid },
      data: { state: 1, formed_time: new Date(), name: defaultName },
    });
    await this.prisma.jamApply.updateMany({
      where: { juid },
      data: { state: 4, valid: 0 },
    });
  }

  // ── PUT /editInfo ───────────────────────────────────────────────────────────

  async editJamInfo(
    juid: string,
    data: EditJamInfoInput,
    coverImg?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      name: data.bandName,
      introduce: data.introduce,
      works_link: data.works_link,
      updated_time: new Date(),
    };
    if (coverImg) {
      updateData.cover_img = coverImg;
    }
    await this.prisma.jam.update({
      where: { juid },
      data: updateData,
    });
  }
}
