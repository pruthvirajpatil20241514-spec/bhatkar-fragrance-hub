const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const authRoute = require("./routes/auth.route");
const adminRoute = require("./routes/admin.route");
const productRoute = require("./routes/product.route");
const { httpLogStream } = require("./utils/logger");

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:8080",           // Local development
    "http://localhost:3000",           // Local development
    "https://bhatkar-fragrance-hub-5.onrender.com",  // Render frontend
    "https://bhatkar-fragrance-hub.onrender.com",    // Alternative frontend URL
    "*"                                 // Allow all origins as fallback
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(morgan("combined", { stream: httpLogStream }));

// ✅ CORS with explicit origin whitelist
app.use(cors(corsOptions));

// Add explicit headers for API responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/products", productRoute);

app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    data: {
      message: "API working fine"
    }
  });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({
    status: "error",
    message: err.message
  });
});

module.exports = app;
