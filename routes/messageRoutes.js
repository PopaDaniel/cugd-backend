const express = require("express");
const { handleSendMessage } = require("../controllers/message");

const router = express.Router();

router.post("/send", handleSendMessage);

module.exports = router;
