import express from "express";
import authRoutes from "./routes/authRoutes";
import bloodRequestRoutes from "./routes/bloodRequestRoutes";
import requestResponseRoutes from "./routes/requestResponseRoutes";
import donorMatchingRoutes from "./routes/donorMatchingRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import donationHistoryRoutes from "./routes/donationHistoryRoutes";
import bloodBankStatusRoutes from "./routes/bloodBankStatusRoutes";
import donationCampRoutes from "./routes/donationCampRoutes";
import campRSVPRoutes from "./routes/campRSVPRoutes";
import adminRoutes from "./routes/adminRoutes";
import deviceTokenRoutes from "./routes/deviceTokenRoutes";
import cityRoutes from "./routes/cityRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import donorProfileRoutes from "./routes/donorProfileRoutes";


const app = express();

import cors from "cors";

const isLocalDevelopmentOrigin = (origin: string): boolean => {
  try {
    const { hostname, port } = new URL(origin);
    const isLocalHostname =
      ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname) ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.");

    if (!isLocalHostname) {
      return false;
    }

    return port === "" || port.startsWith("517") || port.startsWith("300") || port.startsWith("417");
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isLocalDevelopmentOrigin(origin)) return callback(null, true);
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blood-requests", bloodRequestRoutes);
app.use("/api/v1/request-responses", requestResponseRoutes);
app.use("/api/v1/donor-matching", donorMatchingRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/donation-history", donationHistoryRoutes);
app.use("/api/v1/blood-bank-status", bloodBankStatusRoutes);
app.use("/api/v1/donation-camps", donationCampRoutes);
app.use("/api/v1/camp-rsvps", campRSVPRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications/devices", deviceTokenRoutes);
app.use("/api/v1/cities", cityRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/donors", donorProfileRoutes);

// Centralized error handler (last middleware)
import { errorHandler } from "./middleware/errorHandler";
app.use(errorHandler);

export default app;