const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../services/emailService");

let refreshTokens = [];
const authControllers = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;

      // Validate required fields
      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json("Vui lòng điền đầy đủ thông tin!");
      }

      // Validate username length
      if (username.length < 6 || username.length > 20) {
        return res.status(400).json("Tên đăng nhập phải từ 6-20 ký tự!");
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json("Mật khẩu phải có ít nhất 6 ký tự!");
      }

      // Kiểm tra password và confirmPassword
      if (password !== confirmPassword) {
        return res.status(400).json("Mật khẩu xác nhận không khớp!");
      }

      // Kiểm tra username tồn tại
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json("Tên đăng nhập đã tồn tại!");
      }

      // Kiểm tra email tồn tại
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json("Email đã được sử dụng!");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      // Save to Database
      await newUser.save();

      // Return success without password
      const { password: _, ...userWithoutPassword } = newUser._doc;
      res.status(201).json({
        message: "Đăng ký thành công!",
        user: userWithoutPassword,
      });
    } catch (err) {
      console.error("Registration error:", err);

      // Handle mongoose validation errors
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
          (error) => error.message
        );
        return res.status(400).json(messages[0]);
      }

      res.status(500).json("Có lỗi xảy ra, vui lòng thử lại sau!");
    }
  },

  //GENERATE ACCESS TOKEN
  generateAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "30d",
      }
    );
  },
  //GENERATE REFRESH TOKEN
  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "365d",
      }
    );
  },
  //LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json("Sai username roi!");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Sai password roi!");
      }
      if (user && validPassword) {
        const accessToken = authControllers.generateAccessToken(user);
        const refreshToken = authControllers.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // sau khi deploy thì set true
          path: "/",
          sameSite: "strict",
        });
        const { password, ...others } = user._doc;
        //Trả về toàn bộ thông tin user trừ password
        res.status(200).json({ ...others, accessToken });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //REFRESH TOKEN
  requestRefreshToken: async (req, res) => {
    // take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You're not authenticated!");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid!");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) {
        console.log(err);
        res.status(403).json("Refresh token is not valid!");
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      // Create new access token, refresh token and send to user
      const newAccessToken = authControllers.generateAccessToken(user);
      const newRefreshToken = authControllers.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false, // sau khi deploy thì set true
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({ accessToken: newAccessToken });
    });
  },

  //LOGOUT
  userLogout: async (req, res) => {
    // Clear the refresh token from the cookie
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.status(200).json("Logged out successfully!");
  },

  //RESET PASSWORD (ADMIN ONLY)
  resetPassword: async (req, res) => {
    try {
      const { userId } = req.body;
      const defaultPassword = "123456";

      // Kiểm tra user tồn tại
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json("Không tìm thấy người dùng!");
      }
      // Hash password mặc định
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      // Cập nhật password mới
      user.password = hashedPassword;
      await user.save();

      // Gửi email thông báo
      const emailSent = await sendPasswordResetEmail(
        user.email,
        defaultPassword,
        user.username
      );
      if (!emailSent) {
        return res
          .status(500)
          .json(
            "Đặt lại mật khẩu thành công nhưng không thể gửi email thông báo!"
          );
      }

      res
        .status(200)
        .json("Đặt lại mật khẩu thành công và đã gửi email thông báo!");
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json("Có lỗi xảy ra khi đặt lại mật khẩu!");
    }
  },
};

//STORE TOKEN
// 1. Local storage
// XSS
// 2. Cookies
// CSRF -> SameSite, HttpOnly, Secure
// 3. Redux store -> accesstoken
// httponly cookies -> refreshtoken

module.exports = authControllers;
