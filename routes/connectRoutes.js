const express = require("express");
const { handleConnect } = require("../controllers/connect");

const router = express.Router();

router.get("/connect", handleConnect);

module.exports = router;
