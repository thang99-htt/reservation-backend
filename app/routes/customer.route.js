const express = require("express");
const customers = require("../controllers/customer.controller");

const router = express.Router();

router.route("/")
    .get(customers.findAll)
    .delete(customers.deleteAll);

router.route("/:id") 
    .get(customers.findOne)
    .put(customers.update)
    .delete(customers.delete);

router.route("/login")
    .post(customers.login);

router.route("/register")
    .post(customers.create);

router.route("/update-status/:id") 
    .put(customers.updateStatus);

module.exports = router;