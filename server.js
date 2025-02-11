require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const userRouter = require("./routes/user");
const courseRouter = require("./routes/course");
const adminRouter = require("./routes/admin");
const app = express();
const PORT = process.env.PORT || 3001;

const MONGO_URL = process.env.MONGO_URL;

cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// database connection

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.use("/uploads", express.static("uploads"));

// routes
app.use(cors());
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", courseRouter);
app.use("/api", adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
