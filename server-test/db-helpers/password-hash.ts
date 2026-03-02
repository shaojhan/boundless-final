import bcrypt from 'bcrypt';

const saltRounds = 10;

export const generateHash = async (plainPassword: string): Promise<string> => {
  return await bcrypt.hash(plainPassword, saltRounds);
};

// hash is stored in db
export const compareHash = async (
  plainPassword: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hash);
};
