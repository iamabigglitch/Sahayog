import express from "express";
import authRoutes from "./routes/authRoutes";
import bloodRequestRoutes from "./routes/bloodRequestRoutes";
import requestResponseRoutes from "./routes/requestResponseRoutes";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blood-requests", bloodRequestRoutes);
app.use("/api/v1/request-responses", requestResponseRoutes);

export default app;
