const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  cnp: {
    type: String,
    default: "empty",
  },
  files: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model("Employees", employeeSchema);

module.exports = Employee;
