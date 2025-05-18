const User = require("../models/User");
const bcrypt = require("bcrypt");

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

  //CREATE NEW USER
  createUser: async (req, res) => {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Tạo user mới
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        isAdmin: req.body.isAdmin || false,
      });

      // Lưu user vào database
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //UPDATE USER
  updateUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy user" });
      }

      // Cập nhật thông tin
      if (req.body.username) user.username = req.body.username;
      if (req.body.email) user.email = req.body.email;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;

      const updatedUser = await user.save();
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //DELETE USER
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy user" });
      }
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Xóa user thành công" });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = userController;
