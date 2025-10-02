require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/database");
const integrationRoutes = require("./src/routes/integration.routes");

const app = express();

// Middleware
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use("/api/integrations", integrationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
