import User from "../models/User";
import { UserRole } from "../types/enums";
import { hashPassword } from "../utils/passwordUtil";

const MIN_PASSWORD_LENGTH = 8;

// Makes sure the administrator account described in .env exists.
//
//   ADMIN_PHONE=98XXXXXXXX
//   ADMIN_PASSWORD=choose-a-strong-password
//
// - No account with that phone: it is created as a verified admin.
// - An account exists as a donor: it is promoted to admin.
// - It is already an admin: nothing happens.
//
// An existing account's password is never changed here.
export const seedAdmin = async (): Promise<void> => {
  const phone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!phone || !password) {
    console.log("Admin account: ADMIN_PHONE and ADMIN_PASSWORD are not set, skipping.");
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.warn(
      `Admin account: ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters, skipping.`
    );
    return;
  }

  try {
    const existing = await User.findOne({ where: { phone } });

    if (!existing) {
      await User.create({
        phone,
        password_hash: await hashPassword(password),
        role: UserRole.ADMIN,
        phone_verified: true,
      });

      console.log(`Admin account created for ${phone}.`);
      return;
    }

    const currentRole = existing.getDataValue("role") as string;

    if (currentRole === UserRole.ADMIN) {
      return;
    }

    await existing.update({ role: UserRole.ADMIN });

    console.log(`Existing account ${phone} promoted to admin.`);
  } catch (error) {
    // A problem here should never stop the server from starting
    console.error("Admin account setup failed:", error);
  }
};