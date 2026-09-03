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


const app = express();

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

export default app;
