const express = require("express");
const admin = require("../controllers/auth.controller");

const router = express.Router();

router.route("/login")
    .post(admin.login);

module.exports = router;