const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");

const router = require("express").Router();

//GET ALL USERS
router.get("/", middlewareController.verifyToken, userController.getALLUsers);

//CREATE NEW USER
router.post(
  "/",
  middlewareController.verifyTokenAndAdminAuth,
  userController.createUser
);

//UPDATE USER
router.put(
  "/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.updateUser
);

//DELETE USER
//v1/user/:id
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);

module.exports = router;
