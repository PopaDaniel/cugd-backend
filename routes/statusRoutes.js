const express = require("express");
const {
  handleStatus,
  handleWhatsAppDisconnect,
} = require("../controllers/status");

const router = express.Router();

router.get("/status", handleStatus);
router.get("/disconnect", handleWhatsAppDisconnect);

module.exports = router;
