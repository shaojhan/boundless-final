export interface FavoriteItem {
  id: number;
  pid: number;
  puid: string;
  name: string;
  price: number | null;
  img: string | null;
  type: number | null; // 1=instrument, 2=lesson
  created_at: Date;
}
