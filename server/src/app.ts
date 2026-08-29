import express from "express";
import authRoutes from "./routes/authRoutes";
import bloodRequestRoutes from "./routes/bloodRequestRoutes";
import requestResponseRoutes from "./routes/requestResponseRoutes";
import donorMatchingRoutes from "./routes/donorMatchingRoutes";
import notificationRoutes from "./routes/notificationRoutes";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blood-requests", bloodRequestRoutes);
app.use("/api/v1/request-responses", requestResponseRoutes);
app.use("/api/v1/donor-matching", donorMatchingRoutes);
app.use("/api/v1/notifications", notificationRoutes);

export default app;
