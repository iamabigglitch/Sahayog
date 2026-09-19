import dotenv from "dotenv";
import {
  App,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

dotenv.config();

let firebaseAdmin: App | null = null;
let firebaseInitialized = false;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/\\n/g, "\n")
  .trim();

if (!projectId || !clientEmail || !privateKey) {
  console.warn(
    "[Firebase] Not configured (missing project ID, client email, or private key). Push notifications will be disabled."
  );
} else {
  try {
    firebaseAdmin =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });

    firebaseInitialized = true;
  } catch (error) {
    console.warn(
      "[Firebase] Failed to initialize — push notifications will be disabled.",
      error instanceof Error ? error.message : error
    );
  }
}

export { firebaseInitialized };
export default firebaseAdmin;