import dotenv from "dotenv";
import sequelize from "./config/database";

import app from "./app";
import { RequestExpiryService } from "./services/requestExpiryService";

// Import models so their associations are registered
import "./models";

dotenv.config();

const PORT = process.env.PORT || 5000;


async function startServer() {
  try {

    // Connect to PostgreSQL
    await sequelize.authenticate();

    console.log("Database connected successfully!");


    // Avoid automatic schema alterations on startup.
    // In this project the database is managed separately, and
    // Sequelize's `alter: true` can trigger PostgreSQL index-cache
    // failures on an existing database during local development.
    await sequelize.sync();

    console.log("Database synchronized!");


    // Start the request auto-expiry background job
    RequestExpiryService.startExpiryJob();


    // Start Express server
    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

  } catch (error) {

    console.error(
      "Failed to start server:",
      error
    );

  }
}


startServer();