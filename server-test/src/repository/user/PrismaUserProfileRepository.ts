import type { PrismaClient } from '#generated/prisma/client.js';
import type { IUserProfileRepository } from './IUserProfileRepository.js';
import type {
  UserProfile,
  PublicUserHomepage,
  UserWithJam,
  UpdateProfileInput,
  OrderItem,
} from '../../domain/user/UserProfile.js';

export class PrismaUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<UserProfile | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, valid: 1 },
      select: {
        id: true, uid: true, name: true, email: true,
        nickname: true, phone: true, birthday: true,
        postcode: true, country: true, township: true, address: true,
        genre_like: true, play_instrument: true, info: true,
        gender: true, privacy: true, google_uid: true,
        my_jam: true, photo_url: true, my_lesson: true, img: true, valid: true,
      },
    });
    return row ? toDomain(row) : null;
  }

  async findByUid(uid: string): Promise<UserProfile | null> {
    const row = await this.prisma.user.findFirst({
      where: { uid, valid: 1 },
      select: {
        id: true, uid: true, name: true, email: true,
        nickname: true, phone: true, birthday: true,
        postcode: true, country: true, township: true, address: true,
        genre_like: true, play_instrument: true, info: true,
        gender: true, privacy: true, google_uid: true,
        my_jam: true, photo_url: true, my_lesson: true, img: true, valid: true,
      },
    });
    return row ? toDomain(row) : null;
  }

  async getPublicHomepage(uid: string): Promise<PublicUserHomepage | null> {
    const user = await this.prisma.user.findFirst({
      where: { uid, valid: 1 },
      select: {
        email: true, nickname: true, phone: true, birthday: true,
        genre_like: true, play_instrument: true, info: true,
        gender: true, privacy: true, my_jam: true, photo_url: true, img: true,
      },
    });
    if (!user) return null;

    const jam = user.my_jam
      ? await this.prisma.jam.findUnique({
          where: { juid: user.my_jam },
          select: { state: true, name: true },
        })
      : null;

    return {
      email: user.email,
      nickname: user.nickname,
      phone: user.phone,
      birthday: user.birthday,
      genre_like: user.genre_like,
      play_instrument: user.play_instrument,
      info: user.info,
      gender: user.gender,
      privacy: user.privacy,
      my_jam: jam?.name ?? null,
      my_jamState: jam?.state ?? null,
      photo_url: user.photo_url,
      img: user.img,
    };
  }

  async getUserWithJam(id: number): Promise<UserWithJam | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, valid: 1 },
      select: {
        id: true, uid: true, name: true, email: true,
        nickname: true, phone: true, birthday: true,
        postcode: true, country: true, township: true, address: true,
        genre_like: true, play_instrument: true, info: true,
        gender: true, privacy: true, google_uid: true,
        my_jam: true, photo_url: true, my_lesson: true, img: true,
      },
    });
    if (!user) return null;

    const jam = user.my_jam
      ? await this.prisma.jam.findUnique({
          where: { juid: user.my_jam },
          select: { state: true, name: true },
        })
      : null;

    return {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      nickname: user.nickname,
      phone: user.phone,
      birthday: user.birthday,
      postcode: user.postcode,
      country: user.country,
      township: user.township,
      address: user.address,
      genre_like: user.genre_like,
      play_instrument: user.play_instrument,
      info: user.info,
      gender: user.gender,
      privacy: user.privacy,
      google_uid: user.google_uid,
      my_jam: user.my_jam,
      photo_url: user.photo_url,
      my_lesson: user.my_lesson,
      img: user.img,
      my_jamState: jam?.state ?? null,
      my_jamname: jam?.name ?? null,
    };
  }

  async updateProfile(id: number, data: UpdateProfileInput): Promise<UserProfile> {
    const row = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        postcode: data.postcode,
        country: data.country,
        township: data.township,
        address: data.address,
        birthday: data.birthday,
        genre_like: data.genreLike,
        play_instrument: data.playInstrument,
        info: data.info,
        gender: data.gender,
        nickname: data.nickname,
        privacy: data.privacy,
      },
      select: {
        id: true, uid: true, name: true, email: true,
        nickname: true, phone: true, birthday: true,
        postcode: true, country: true, township: true, address: true,
        genre_like: true, play_instrument: true, info: true,
        gender: true, privacy: true, google_uid: true,
        my_jam: true, photo_url: true, my_lesson: true, img: true, valid: true,
      },
    });
    return toDomain(row);
  }

  async updateAvatar(id: number, img: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { img },
    });
  }

  async getOrders(uid: string): Promise<OrderItem[][]> {
    const orders = await this.prisma.orderTotal.findMany({
      where: { user_id: uid },
      include: { orderItems: { include: { product: true } } },
    });

    return orders
      .filter((o) => o.orderItems.length > 0)
      .map((o) =>
        o.orderItems.map((oi) => {
          const { product, ...oiFields } = oi;
          const { orderItems: _orderItems, ...orderFields } = o;
          return { ...product, ...oiFields, ...orderFields };
        })
      );
  }
}

// ── Mapper ─────────────────────────────────────────────────────────────────────

function toDomain(row: {
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
  valid: number;
}): UserProfile {
  return {
    id: row.id,
    uid: row.uid,
    name: row.name,
    email: row.email,
    nickname: row.nickname,
    phone: row.phone,
    birthday: row.birthday,
    postcode: row.postcode,
    country: row.country,
    township: row.township,
    address: row.address,
    genreLike: row.genre_like,
    playInstrument: row.play_instrument,
    info: row.info,
    gender: row.gender,
    privacy: row.privacy,
    googleUid: row.google_uid,
    myJam: row.my_jam,
    photoUrl: row.photo_url,
    myLesson: row.my_lesson,
    img: row.img,
    valid: row.valid,
  };
}
