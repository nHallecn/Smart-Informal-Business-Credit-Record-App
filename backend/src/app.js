const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/generated_reports", express.static(path.join(__dirname, "..", "generated_reports")));

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const syncRoutes = require("./routes/sync");
const reportRoutes = require("./routes/reports");
const scoreRoutes = require("./routes/scores");
const dashboardRoutes = require("./routes/dashboard");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Smart Business Backend API");
});

module.exports = app;
