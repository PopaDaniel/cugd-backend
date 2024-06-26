const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  managerName: {
    type: String,
    required: true,
    unique: true,
  },
  img: {
    data: Buffer,
    contentType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;
