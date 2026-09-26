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


const app = express();

import cors from "cors";

const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, curl) and known dev origins
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
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

// Centralized error handler (last middleware)
import { errorHandler } from "./middleware/errorHandler";
app.use(errorHandler);

export default app;
