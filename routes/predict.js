const router = require("express").Router();
const { predict } = require("../controllers/predictController");

// POST /v1/predict
router.post("/", predict);

module.exports = router;
