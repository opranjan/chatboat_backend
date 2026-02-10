const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// absolute path to uploads folder
const uploadDir = path.join(__dirname, "..", "uploads");

// ✅ create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // <-- uploads folder
  },


  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 🎧 audio upload API
router.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    success: true,
    fileName: req.file.filename,
    url: `http://YOUR_SERVER_IP:5000/uploads/${req.file.filename}`
  });
});

module.exports = router;
