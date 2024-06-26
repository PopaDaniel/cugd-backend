const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  handleAddNewEmployee,
  handleDeleteEmployee,
} = require("../controllers/employee");

const router = express.Router();

router.get("/", getEmployees);
router.get("/employees/:employeeId", getEmployeeById);
router.post("/update-employee", updateEmployee);
router.post("/addNewEmployee", handleAddNewEmployee);
router.delete("/delete/:userId", handleDeleteEmployee);

module.exports = router;
