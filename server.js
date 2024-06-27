const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: "./.env" });
const corsOptions = {
  origin: "https://cugd-app.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
const app = express();
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

mongoose.set("strictQuery", true);
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connected");
});

// Use /tmp directory for sessions in Vercel
const sessionPath = path.join("/tmp", "wwebjs_auth", "session");

// Ensure the session directory exists
fs.mkdirSync(sessionPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("/tmp", "uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Initialize the WhatsApp client
const initializeClient = require("./utils/initializeClient");
initializeClient(app, sessionPath);

// Import routes
const connectRoutes = require("./routes/connectRoutes");
const statusRoutes = require("./routes/statusRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

// Use routes
app.use(connectRoutes);
app.use(statusRoutes);
app.use(upload.array("files"), employeeRoutes);
app.use(messageRoutes);
app.use(authRoutes);

app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Hello, world!" });
  } catch (error) {
    console.error("Function error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
