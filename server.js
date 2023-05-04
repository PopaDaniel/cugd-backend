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
const wbm = require("wbm");

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
  const phones = [...req.body.phones];
  const message = req.body.message;
  console.log(phones, message);
  if (!phones || !message) res.status(400).send("Phone or Message is empty");
  wbm
    .start({ showBrowser: false, qrCodeData: true, session: true })
    .then(async (qrCodeData) => {
      res.send(qrCodeData);
      await wbm.waitQRCode();
      await wbm.send(phones, message);
      await wbm.end();
    })
    .catch((err) => console.log(err));
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
