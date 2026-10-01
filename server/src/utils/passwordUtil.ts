import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;
const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;

//Hashes a plain-text password.
export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const isValidBcryptHash = (value: string): boolean => {
  return typeof value === "string" && BCRYPT_HASH_PATTERN.test(value);
};

// Compares a plain-text password against a bcrypt hash.
// Malformed or stale hashes (for example from older test data) should
// be treated as a credential mismatch instead of crashing bcrypt.
export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  if (!isValidBcryptHash(passwordHash)) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
};