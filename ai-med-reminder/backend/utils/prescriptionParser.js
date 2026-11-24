// Turns raw OCR text from a prescription photo into a best-effort structured
// guess of medicines, dosage and frequency. Prescription handwriting/printing
// varies enormously, so this is heuristic — the frontend always lets the
// user review and edit every field before saving.

const DOSAGE_REGEX = /(\d+(?:\.\d+)?)\s?(mg|mcg|ml|g|iu)\b/i;

const FREQUENCY_PATTERNS = [
  { regex: /\bonce\s?a?\s?day\b|\bod\b|\b1-0-0\b/i, label: "Once daily" },
  { regex: /\btwice\s?a?\s?day\b|\bbd\b|\bbid\b|\b1-0-1\b/i, label: "Twice daily" },
  { regex: /\bthrice\s?a?\s?day\b|\btds\b|\btid\b|\b1-1-1\b/i, label: "Three times daily" },
  { regex: /\bfour\s?times\s?a?\s?day\b|\bqid\b/i, label: "Four times daily" },
  { regex: /\bevery\s?(\d+)\s?hours?\b/i, label: "Every N hours" },
  { regex: /\bbefore\s?food\b|\bbf\b/i, label: "Before food" },
  { regex: /\bafter\s?food\b|\baf\b/i, label: "After food" },
  { regex: /\bat\s?night\b|\bhs\b/i, label: "At night" },
];

// Words that commonly appear on prescriptions but are not medicine names.
const NOISE_WORDS = [
  "dr.", "dr ", "hospital", "clinic", "date", "age", "sex", "patient",
  "address", "signature", "reg no", "diagnosis", "rx", "prescription",
  "phone", "mobile", "email", "www", "http",
];

function looksLikeNoise(line) {
  const lower = line.toLowerCase();
  return NOISE_WORDS.some((w) => lower.includes(w)) || line.trim().length < 3;
}

function detectFrequency(line) {
  for (const pattern of FREQUENCY_PATTERNS) {
    if (pattern.regex.test(line)) return pattern.label;
  }
  return "";
}

function parsePrescriptionText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const candidates = [];

  lines.forEach((line) => {
    if (looksLikeNoise(line)) return;

    const dosageMatch = line.match(DOSAGE_REGEX);
    const frequency = detectFrequency(line);

    // A line is a plausible medicine entry if it has a dosage OR frequency
    // marker, or simply starts with a capitalised word (common for drug
    // names printed/handwritten on Rx pads).
    const startsCapitalized = /^[A-Z][a-zA-Z0-9\-]{2,}/.test(line);

    if (dosageMatch || frequency || startsCapitalized) {
      let name = line;

      if (dosageMatch) {
        name = line.slice(0, dosageMatch.index).trim();
      }
      // Strip leading numbering like "1." or "1)"
      name = name.replace(/^\d+[\).\s-]+/, "").trim();
      // Strip trailing punctuation
      name = name.replace(/[-:,]+$/, "").trim();

      if (!name || name.length < 2) return;

      candidates.push({
        rawLine: line,
        name,
        dosage: dosageMatch ? `${dosageMatch[1]}${dosageMatch[2]}` : "",
        frequency: frequency || "",
      });
    }
  });

  // De-duplicate by name (case-insensitive)
  const seen = new Set();
  const deduped = candidates.filter((c) => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped;
}

module.exports = { parsePrescriptionText };
