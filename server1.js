const express = require("express");
const mongoose = require("mongoose");
const signin = require("./controllers/signin");
const addEmployee = require("./controllers/addNewEmployee");
const dotenv = require("dotenv");
const User = require("./controllers/userController");
const Employee = require("./controllers/employeeController");
const multer = require("multer");
const Manager = require("./controllers/managerController");
const cors = require("cors");
const { Client } = require("whatsapp-web.js");

//let client = new Client();
//let client;
//const fs = require("fs");
// const { Client, LegacySessionAuth } = require("whatsapp-web.js");
// const fs = require("fs");
// const SESSION_FILE_PATH = "./session.json";
// let sessionData;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//   sessionData = require(SESSION_FILE_PATH);
// }
// const client = new Client({
//   authStrategy: new LegacySessionAuth({
//     session: {},
//   }),
// });
let qr;
let isUserLogged = false;
const client = new Client({
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});
client.on("qr", (qrCode) => {
  qr = qrCode;
  console.log("QR RECEIVED", qrCode);
});

client.on("ready", () => {
  isUserLogged = true;
  console.log("Client is ready!");
});
client.initialize();

dotenv.config({ path: "./config.env" });
mongoose.set("strictQuery", true);

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connected");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
app.post("/send", async (req, res) => {
  try {
    const numbers = req.body.phones;
    const message = req.body.message;
    //let numbers = ["40760018103@c.us", "40760018103@c.us", "40760018103@c.us"];
    for (let i = 0; i < numbers.length; i++) {
      // const number = await client.getNumberId(numbers[i]);

      client
        .sendMessage(numbers[i], message)
        .then((message) => {
          //console.log("Message sent successfully:", message);
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    }
  } catch (error) {
    console.error("Error getting contacts:", error);
  }
});

app.get("/qrcode", async (req, res) => {
  try {
    if (isUserLogged) {
      await client.logout();
    }
    res.send(qr);
  } catch (error) {
    console.error("Error handling /qrcode request", error);
    res.status(500).send("Error handling /qrcode request");
  }
});

app.get("/", async (req, res) => {
  const getEmployees = await Employee.find();
  const getManager = await Manager.find();
  res.send([getManager, getEmployees]);
});

app.get("/employees/:employeeId", async (req, res) => {
  const id = req.params.employeeId;
  if (mongoose.isValidObjectId(id)) {
    const employee = await Employee.findById(id);
    res.status(200).send(employee);
  } else {
    res.status(404).send("ERROR");
  }
});

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, User);
});
app.post("/addNewEmployee", upload.single("img"), (req, res) => {
  addEmployee.handleAddNewEmployee(req, res, Employee);
});

app.listen(process.env.PORT, () => {
  console.log(`App listen on port ${process.env.PORT}`);
});
