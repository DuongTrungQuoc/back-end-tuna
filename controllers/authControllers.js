const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let refreshTokens = [];
const authControllers = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      // Kiểm tra password và confirmPassword
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json("Mật khẩu xác nhận không khớp!");
      }

      // Kiểm tra username tồn tại
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json("Tên đăng nhập đã tồn tại!");
      }

      // Kiểm tra email tồn tại
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json("Email đã được sử dụng!");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      //Create new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      // Save to Database
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
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
};

//STORE TOKEN
// 1. Local storage
// XSS
// 2. Cookies
// CSRF -> SameSite, HttpOnly, Secure
// 3. Redux store -> accesstoken
// httponly cookies -> refreshtoken

module.exports = authControllers;
