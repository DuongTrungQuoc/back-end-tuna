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
router.post("/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Thay thế phần demo kết quả bằng cấu trúc dữ liệu mong muốn
    const results = {
      HPO: 0.0, // Placeholder value
      Lab: {
        "L*": 0.0, // Placeholder value
        "a*": 0.0, // Placeholder value
        "b*": 0.0, // Placeholder value
      },
      MetMb: 0.0, // Placeholder value
      RGB: {
        B: 0.0, // Placeholder value
        G: 0.0, // Placeholder value
        R: 0.0, // Placeholder value
      },
      TBARS: 0.0, // Placeholder value
    };

    res.json({
      success: true,
      data: results,
      // imagePath: req.file.path, // Remove imagePath
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ message: "Error processing image" });
  }
});

module.exports = router;
