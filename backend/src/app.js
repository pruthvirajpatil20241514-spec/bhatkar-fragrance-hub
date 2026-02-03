const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const authRoute = require("./routes/auth.route");
const adminRoute = require("./routes/admin.route");
const productRoute = require("./routes/product.route");
const { httpLogStream } = require("./utils/logger");

const app = express();

// ===== CRITICAL: CORS MUST BE FIRST =====
// Allow all origins - no restrictions for now
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Max-Age", "3600");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Also use cors middleware
app.use(cors({
  origin: "*",
  credentials: false,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(morgan("combined", { stream: httpLogStream }));

// ===== HEALTH CHECK ENDPOINT (for debugging) =====
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "Backend API is running with CORS enabled"
  });
});

app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    data: {
      message: "API working fine"
    }
  });
});

// ===== API ROUTES =====
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/products", productRoute);

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
