const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const { Client, LocalAuth } = require("whatsapp-web.js");
const initializeClient = require("./utils/initializeClient");

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());

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

app.locals.client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
initializeClient(app);

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
  console.log(`App listening on port ${process.env.PORT}`);
});
