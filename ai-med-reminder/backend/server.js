require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ensureStore } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const medicineRoutes = require("./routes/medicine.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const chatRoutes = require("./routes/chat.routes");

ensureStore();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MediMind API", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Central error handler - keeps error responses consistent & never leaks stack traces
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MediMind API running at http://localhost:${PORT}`);
});
