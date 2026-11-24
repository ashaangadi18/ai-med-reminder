// Lightweight JSON-file "database".
// We intentionally avoid SQLite / native modules here because they require
// a compiler toolchain and have caused native-build failures on Windows in
// earlier project setups. Plain JSON files keep this project runnable with
// nothing more than Node.js installed.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const FILES = {
  users: path.join(DATA_DIR, "users.json"),
  medicines: path.join(DATA_DIR, "medicines.json"),
  logs: path.join(DATA_DIR, "logs.json"),
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  Object.values(FILES).forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
    }
  });
}

function readTable(name) {
  ensureStore();
  const raw = fs.readFileSync(FILES[name], "utf-8");
  try {
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error(`Failed to parse ${name}.json, resetting to empty array.`, err);
    return [];
  }
}

function writeTable(name, data) {
  ensureStore();
  fs.writeFileSync(FILES[name], JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { ensureStore, readTable, writeTable };
