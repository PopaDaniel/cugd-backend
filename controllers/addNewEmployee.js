const fs = require("fs");

const handleAddNewEmployee = async (req, res, Employee) => {
  const { employeeName, phoneNumber, cnp } = req.body;
  const findEmployee = await Employee.find({ employeeName: employeeName });

  if (findEmployee.length) {
    return res.status(400).json("Employee already exists");
  } else {
    // Employee.create(
    //   {
    //     employeeName: employeeName,
    //     phoneNumber: phoneNumber,
    //   },
    //   function (err, user) {
    //     if (err) {
    //       console.log("Error adding Employee: ", err);
    //       res.status(400).json(err);
    //     } else {
    //       console.log("Employee added: ", user);
    //       res.status(201).json(user);
    //     }
    //   }
    // );

    // data: fs.readFileSync(
    //   `uploads/${
    //     req.file.filename === undefined ? "users.png" : req.file.filename
    //   }`
    //data: fs.readFileSync("uploads/" + req.file.filename),
    const createEmployee = new Employee({
      employeeName: employeeName,
      phoneNumber: phoneNumber,
      cnp: cnp,
      img: {
        data: fs.readFileSync(
          `uploads/${
            !req.file ? "img-profile-default-app.png" : req.file.filename
          }`
        ),
        contentType: "image/png",
      },
    });
    createEmployee
      .save()
      .then((doc) => {
        //console.log("Employee added: ", doc);
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
