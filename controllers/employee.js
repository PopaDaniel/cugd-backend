const Employee = require("../models/employee");
const Manager = require("../models/manager");
const mongoose = require("mongoose");
const fs = require("fs");

const getEmployees = async (req, res) => {
  const getEmployees = await Employee.find();
  const getManager = await Manager.find();
  res.send(getEmployees);
  //res.send([getManager, getEmployees]);
};

const getEmployeeById = async (req, res) => {
  const id = req.params.employeeId;
  if (mongoose.isValidObjectId(id)) {
    const employee = await Employee.findById(id);
    res.status(200).send(employee);
  } else {
    res.status(404).send("ERROR");
  }
};

const updateEmployee = async (req, res) => {
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

    if (!Array.isArray(files)) {
      throw new Error("Files should be an array");
    }

    employee.files = files.map((file, index) => {
      if (!file || typeof file !== "object") {
        throw new Error(`Invalid file at index ${index}`);
      }

      const { contentType, data } = file;

      if (!contentType || !data) {
        throw new Error(`Invalid file data at index ${index}`);
      }

      const fileData = Array.isArray(data) ? data : data.data || [];

      if (!Array.isArray(fileData)) {
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
    res
      .status(500)
      .json({ success: false, message: "Error updating employee", error });
  }
};

const handleAddNewEmployee = async (req, res) => {
  const { employeeName, phoneNumber, cnp } = req.body;
  const findEmployee = await Employee.find({ employeeName: employeeName });

  if (findEmployee.length) {
    return res.status(400).json("Employee already exists");
  } else {
    const filesData = req.files.map((file) => ({
      data: fs.readFileSync(`uploads/${file.filename}`),
      contentType: file.mimetype,
    }));

    const createEmployee = new Employee({
      employeeName: employeeName,
      phoneNumber: phoneNumber,
      cnp: cnp,
      files: filesData,
    });

    createEmployee
      .save()
      .then((doc) => {
        res.status(201).json(doc);
      })
      .catch((err) => {
        console.log("Error adding Employee: ", err);
        res.status(400).json(err);
      });
  }
};
const handleDeleteEmployee = async (req, res) => {
  try {
    const userId = req.params.userId;
    const employee = await Employee.findByIdAndDelete(userId);

    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  handleAddNewEmployee,
  handleDeleteEmployee,
};
