const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { predict } = require("../controllers/predictController");

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// POST /v1/predict
router.post("/", predict);

// POST /v1/predict/image
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Đây là phần demo, kết quả được tạo ngẫu nhiên
    const results = {
      MetMb: (Math.random() * 2).toFixed(2),
      TBARS: (Math.random() * 3).toFixed(2),
      Peroxide: (Math.random() * 4).toFixed(2),
    };

    res.json({
      success: true,
      data: results,
      imagePath: req.file.path,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ message: "Error processing image" });
  }
});

module.exports = router;
