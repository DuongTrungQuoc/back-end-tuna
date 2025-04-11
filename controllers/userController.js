const User = require("../models/User");

const userController = {
  //GET ALL USERS
  getALLUsers: async (req, res) => {
    try {
      const user = await User.find();
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //DELETE USER
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      // nếu muốn xóa thật thì dùng findByIdAndDelete
      res.status(200).json("Xóa thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
module.exports = userController;
