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
const { Client, LocalAuth } = require("whatsapp-web.js");

let qr;
let isUserLogged = false;
const app = express();
app.use(cors());

let client;
let isClientInitialized = false;

const initializeClient = () => {
  if (isClientInitialized) {
    return;
  }

  client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
  });

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    app.locals.qrCode = qr;
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    isUserLogged = true;
  });

  client.on("authenticated", () => {
    console.log("AUTHENTICATED");
  });

  client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
    isUserLogged = false;
  });

  client.on("disconnected", (reason) => {
    console.log("Client disconnected", reason);
    isUserLogged = false;
    isClientInitialized = false;
    client = null;
    initializeClient();
  });

  client.initialize();
  isClientInitialized = true;
};

initializeClient();

app.get("/connect", (req, res) => {
  if (isUserLogged) {
    res.send({ message: "Client already connected" });
  } else if (app.locals.qrCode) {
    res.json({ qr: app.locals.qrCode });
  } else {
    initializeClient();
    res.json({ message: "Generating QR code..." });
  }
});

app.get("/status", (req, res) => {
  if (isUserLogged) {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

dotenv.config({ path: "./config.env" });
mongoose.set("strictQuery", true);

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

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
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post("/send", async (req, res) => {
  try {
    const numbers = req.body.phones;
    const message = req.body.message;
    const failedNumbers = [];
    const sendMessages = numbers.map(async (number) => {
      try {
        await client.sendMessage(number, message);
        return { number, status: "success" };
      } catch (error) {
        if (error.message.includes("invalid wid")) {
          console.error(`Invalid WID for number: ${number}`);
          failedNumbers.push(number);
          return { number, status: "failed", error: "Invalid WID" };
        }
        throw error;
      }
    });

    const results = await Promise.all(sendMessages);

    const failed = results.filter((result) => result.status === "failed");
    const successful = results.filter((result) => result.status === "success");
    if (failed.length > 0) {
      res.status(500).json({
        message: "Some messages failed to send",
        failed,
        successful,
      });
    } else {
      res.status(200).json({
        message: "Messages sent successfully to all numbers",
        successful,
      });
    }
  } catch (error) {
    console.error("Error sending messages:", error);
    res
      .status(500)
      .json({ message: "Error sending messages", failed: failedNumbers });
  }
});

app.get("/", async (req, res) => {
  const getEmployees = await Employee.find();
  const getManager = await Manager.find();
  res.send([getManager, getEmployees]);
});

app.get("/disconnect", async (req, res) => {
  if (client) {
    try {
      await client.logout();
      client.destroy();
      client = null;
      app.locals.qrCode = null;
      res.json({ message: "Client disconnected" });
    } catch (error) {
      console.error("Error during disconnection:", error);
      res.status(500).json({ message: "Error during disconnection", error });
    }
  } else {
    res.json({ message: "Client not connected" });
  }
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

app.post("/update-employee", async (req, res) => {
  const { id, employeeName, phoneNumber, cnp, files } = req.body;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    employee.employeeName = employeeName;
    employee.phoneNumber = phoneNumber;
    employee.cnp = cnp;

    // Convert file data to Buffer with checks
    if (!Array.isArray(files)) {
      throw new Error("Files should be an array");
    }

    employee.files = files.map((file, index) => {
      if (!file || typeof file !== "object") {
        console.error(`Invalid file at index ${index}:`, file);
        throw new Error(`Invalid file at index ${index}`);
      }

      const { contentType, data } = file;

      if (!contentType || !data) {
        console.error(`Invalid file data at index ${index}:`, file);
        throw new Error(`Invalid file data at index ${index}`);
      }

      // Handle the case where data is an object with type 'Buffer'
      const fileData = Array.isArray(data) ? data : data.data || [];

      if (!Array.isArray(fileData)) {
        console.error(`Invalid file data at index ${index}:`, file);
        throw new Error(`Invalid file data at index ${index}`);
      }

      return {
        data: Buffer.from(fileData),
        contentType,
      };
    });

    await employee.save();
    res.json({ success: true, message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating employee", error });
  }
});

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, User);
});

app.post("/addNewEmployee", upload.array("files", 10), (req, res) => {
  addEmployee.handleAddNewEmployee(req, res, Employee);
});

app.listen(process.env.PORT, () => {
  console.log(`App listen on port ${process.env.PORT}`);
});
