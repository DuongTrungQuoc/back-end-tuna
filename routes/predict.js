const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { predict, predictImage } = require("../controllers/predictController");

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
router.post("/image", upload.single("file"), predictImage);

module.exports = router;
