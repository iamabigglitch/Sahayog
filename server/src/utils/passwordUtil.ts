import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

//Hashes a plain-text password.
export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

//Compares a plain-text password against a bcrypt hash.
export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};