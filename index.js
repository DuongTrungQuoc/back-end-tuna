const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const predictRoutes = require("./routes/predict");
dotenv.config();
const app = express();

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json()); // to parse json data

//ROUTES
app.use("/v1/auth", authRoutes);
app.use("/v1/user", userRoutes);
app.use("/v1/predict", predictRoutes);

app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port", process.env.PORT || 8000);
});

connectDatabase();

//AUTHENTICATION (so sánh dữ liệu nhập với database)
//AUTHORIZATION (kiểm tra quyền truy cập)
