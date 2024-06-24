const fs = require("fs");

const handleAddNewEmployee = async (req, res, Employee) => {
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

module.exports = {
  handleAddNewEmployee: handleAddNewEmployee,
};
