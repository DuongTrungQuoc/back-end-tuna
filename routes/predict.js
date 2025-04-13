const router = require("express").Router();
const predictController = require("../controllers/predictController");

// POST /v1/predict
router.post("/", predictController.predictRGB);

module.exports = router;
