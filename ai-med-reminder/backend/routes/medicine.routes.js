const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readTable, writeTable } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(requireAuth);

// GET /api/medicines - all medicines for the logged-in user
router.get("/", (req, res) => {
  const medicines = readTable("medicines").filter((m) => m.userId === req.user.id);
  res.json(medicines);
});

// POST /api/medicines - create a new medicine
router.post("/", (req, res) => {
  const { name, dosage, frequency, times, startDate, endDate, notes, stock } = req.body;

  if (!name || !times || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ message: "Medicine name and at least one reminder time are required." });
  }

  const medicines = readTable("medicines");
  const newMedicine = {
    id: uuidv4(),
    userId: req.user.id,
    name,
    dosage: dosage || "",
    frequency: frequency || "Daily",
    times, // array of "HH:MM" strings
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || null,
    notes: notes || "",
    stock: typeof stock === "number" ? stock : null,
    createdAt: new Date().toISOString(),
  };

  medicines.push(newMedicine);
  writeTable("medicines", medicines);
  res.status(201).json(newMedicine);
});

// PUT /api/medicines/:id - update a medicine
router.put("/:id", (req, res) => {
  const medicines = readTable("medicines");
  const idx = medicines.findIndex((m) => m.id === req.params.id && m.userId === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ message: "Medicine not found." });
  }
  medicines[idx] = { ...medicines[idx], ...req.body, id: medicines[idx].id, userId: medicines[idx].userId };
  writeTable("medicines", medicines);
  res.json(medicines[idx]);
});

// DELETE /api/medicines/:id
router.delete("/:id", (req, res) => {
  const medicines = readTable("medicines");
  const filtered = medicines.filter((m) => !(m.id === req.params.id && m.userId === req.user.id));
  if (filtered.length === medicines.length) {
    return res.status(404).json({ message: "Medicine not found." });
  }
  writeTable("medicines", filtered);
  res.json({ message: "Medicine removed." });
});

// GET /api/medicines/today/schedule - flattened list of today's doses with status
router.get("/today/schedule", (req, res) => {
  const medicines = readTable("medicines").filter((m) => m.userId === req.user.id);
  const logs = readTable("logs").filter((l) => l.userId === req.user.id);
  const today = new Date().toISOString().slice(0, 10);

  const schedule = [];
  medicines.forEach((m) => {
    if (m.startDate && m.startDate > today) return;
    if (m.endDate && m.endDate < today) return;

    m.times.forEach((time) => {
      const log = logs.find((l) => l.medicineId === m.id && l.date === today && l.time === time);
      schedule.push({
        medicineId: m.id,
        name: m.name,
        dosage: m.dosage,
        time,
        date: today,
        status: log ? log.status : "pending", // pending | taken | missed | skipped
        logId: log ? log.id : null,
      });
    });
  });

  schedule.sort((a, b) => a.time.localeCompare(b.time));
  res.json(schedule);
});

// POST /api/medicines/:id/log - mark a dose taken / skipped for today
router.post("/:id/log", (req, res) => {
  const { time, status } = req.body; // status: taken | skipped | missed
  if (!time || !status) {
    return res.status(400).json({ message: "time and status are required." });
  }

  const medicines = readTable("medicines");
  const medicine = medicines.find((m) => m.id === req.params.id && m.userId === req.user.id);
  if (!medicine) {
    return res.status(404).json({ message: "Medicine not found." });
  }

  const logs = readTable("logs");
  const today = new Date().toISOString().slice(0, 10);
  const existingIdx = logs.findIndex(
    (l) => l.medicineId === req.params.id && l.date === today && l.time === time && l.userId === req.user.id
  );

  const entry = {
    id: existingIdx !== -1 ? logs[existingIdx].id : uuidv4(),
    userId: req.user.id,
    medicineId: req.params.id,
    date: today,
    time,
    status,
    loggedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    logs[existingIdx] = entry;
  } else {
    logs.push(entry);
  }
  writeTable("logs", logs);
  res.json(entry);
});

// GET /api/medicines/stats/adherence - simple adherence percentage over last 7 days
router.get("/stats/adherence", (req, res) => {
  const logs = readTable("logs").filter((l) => l.userId === req.user.id);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = logs.filter((l) => new Date(l.date) >= sevenDaysAgo);
  const taken = recent.filter((l) => l.status === "taken").length;
  const total = recent.length || 1;
  res.json({ takenCount: taken, totalCount: recent.length, adherencePercent: Math.round((taken / total) * 100) });
});

module.exports = router;
