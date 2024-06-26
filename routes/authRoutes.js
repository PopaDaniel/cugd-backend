const express = require("express");
const { handleSignin } = require("../controllers/auth");

const router = express.Router();

router.post("/signin", handleSignin);

module.exports = router;
