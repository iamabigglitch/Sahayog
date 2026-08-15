import dotenv from "dotenv";
import sequelize from "./config/database";

import app from "./app";

// Import models so their associations are registered
import "./models";

dotenv.config();

const PORT = process.env.PORT || 5000;


async function startServer() {
  try {

    // Connect to PostgreSQL
    await sequelize.authenticate();

    console.log("Database connected successfully!");


    // Create tables if they don't exist
    await sequelize.sync({ alter: true });

    console.log("Database synchronized!");


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