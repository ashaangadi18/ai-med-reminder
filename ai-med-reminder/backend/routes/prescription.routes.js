const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const { requireAuth } = require("../middleware/auth.middleware");
const { parsePrescriptionText } = require("../utils/prescriptionParser");

const router = express.Router();
router.use(requireAuth);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PNG, JPG or WEBP images are supported."));
  },
});

// POST /api/prescriptions/scan - upload a prescription photo, get structured guesses back
router.post("/scan", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Please attach a prescription image." });
    }

    const filePath = req.file.path;

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(filePath, "eng");

      const extracted = parsePrescriptionText(text);

      res.json({
        rawText: text,
        extracted,
        message:
          extracted.length > 0
            ? `Found ${extracted.length} possible medicine${extracted.length > 1 ? "s" : ""}. Please review before saving.`
            : "Couldn't confidently detect medicines from this image. You can add them manually below.",
      });
    } catch (ocrErr) {
      console.error("OCR error:", ocrErr);
      res.status(500).json({
        message: "Couldn't read this image. Try a clearer, well-lit photo, or add the medicine manually.",
      });
    } finally {
      // Clean up the uploaded file after processing.
      fs.unlink(filePath, () => {});
    }
  });
});

module.exports = router;
