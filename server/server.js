const express = require("express");
const path = require("path");
const { connectDB } = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const savedEventRoutes = require("./routes/savedEventRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const searchRoutes = require("./routes/searchRoutes");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/savedevents", savedEventRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/search", searchRoutes);

if (require.main === module) {
  connectDB()
    .then(() =>
      app.listen(port, () =>
        console.log(`Server running on http://localhost:${port}`),
      ),
    )
    .catch((err) => {
      console.error("Failed to connect MongoDB:", err);
      process.exit(1);
    });
}

module.exports = app;
