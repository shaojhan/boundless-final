/**
 * Category value objects — Catalog domain
 * Pure TypeScript — no Prisma / Express imports.
 */

export interface InstrumentCategory {
  id: number;
  parent_id: number | null;
  name: string;
}

export interface LessonCategory {
  id: number;
  name: string;
  valid: number;
}
