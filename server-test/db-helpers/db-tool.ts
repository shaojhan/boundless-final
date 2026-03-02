import type { Request } from 'express';

export const getWhere = (conditions: string[], joinWith = 'AND'): string => {
  const conditionsValues = conditions.filter((v) => v);

  return conditionsValues.length > 0
    ? `WHERE ` + conditionsValues.map((v) => `( ${v} )`).join(` ${joinWith} `)
    : '';
};

// 排序用，orderby=id,asc
export const getOrder = (orderby = 'id,asc'): string => {
  const column = orderby.split(',')[0];
  const keyword = orderby.split(',')[1];

  if (!column || !keyword) return '';

  return `ORDER BY ${column} ${keyword}`;
};

// only for mysql
export const getBetween = (
  value: string,
  dbColumn: string,
  min: number,
  max: number
): string => {
  if (!value) return '';

  const ranges = value.split(',');
  const minValue = Number(ranges[0]);
  const maxValue = Number(ranges[1]);

  if (isNaN(minValue) || isNaN(maxValue)) return '';
  if (minValue < min || maxValue > max) return '';

  return `${dbColumn} BETWEEN ${minValue} AND ${maxValue}`;
};

// only for mysql
// colors=1,2 → FIND_IN_SET(1, color) OR FIND_IN_SET(2, color)
export const getFindInSet = (
  value: string,
  dbColumn: string,
  isNumber = true
): string => {
  if (!value) return '';

  return value
    .split(',')
    .map((v) => `FIND_IN_SET(${isNumber ? Number(v) : v}, ${dbColumn})`)
    .join(' OR ');
};

// Assert the request ID param is valid and convert to number
export const getIdParam = (req: Request): number => {
  const id = req.params.id as string;
  if (/^\d+$/.test(id)) {
    return Number.parseInt(id, 10);
  }
  throw new TypeError(`Invalid ':id' param: "${id}"`);
};

interface SequelizeModel {
  findOne(opts: { where: Record<string, unknown> }): Promise<unknown>;
  create(data: Record<string, unknown>): Promise<unknown>;
  update(
    data: Record<string, unknown>,
    opts: { where: Record<string, unknown> }
  ): Promise<unknown>;
}

// Sequelize upsert helper（留存備用）
export const updateOrCreate = async (
  model: SequelizeModel,
  where: Record<string, unknown>,
  newItem: Record<string, unknown>
): Promise<{ item: unknown; created: boolean }> => {
  const foundItem = await model.findOne({ where });
  if (!foundItem) {
    const item = await model.create(newItem);
    return { item, created: true };
  }
  const item = await model.update(newItem, { where });
  return { item, created: false };
};
