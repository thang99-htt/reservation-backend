const express = require("express");
const bookings = require("../controllers/booking.controller");

const router = express.Router();

router.route("/")
    .get(bookings.findAll)
    .post(bookings.create)
    .delete(bookings.deleteAll);

router.route("/available")
    .get(bookings.findAllAvailable);

router.route("/:id") 
    .get(bookings.findOne)
    .put(bookings.update)
    .delete(bookings.delete);

router.route("/update-status/:id") 
    .put(bookings.updateStatus);

module.exports = router;