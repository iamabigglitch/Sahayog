import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";

// Import models so their associations are registered
import "./models";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sahayog API is running");
});

async function startServer() {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    // Create tables if they don't exist
    await sequelize.sync({ alter: true });
    console.log("Database synchronized!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();