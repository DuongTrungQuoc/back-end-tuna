const authController = require("../controllers/authControllers");
const middlewareController = require("../controllers/middlewareController");
const router = require("express").Router();

//REGISTER
router.post("/register", authController.registerUser);

//LOGIN
router.post("/login", authController.loginUser);

//REFRESH TOKEN
router.post("/refresh", authController.requestRefreshToken);

//LOGOUT
router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.userLogout
);

//RESET PASSWORD (Admin only)
router.post(
  "/reset-password",
  middlewareController.verifyToken,
  authController.resetPassword
);

module.exports = router;
