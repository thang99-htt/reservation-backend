const express = require("express");
const rooms = require("../controllers/room.controller");

const router = express.Router();

router.route("/")
    .get(rooms.findAll)
    .post(rooms.create)
    .delete(rooms.deleteAll);

router.route("/:id") 
    .get(rooms.findOne)
    .put(rooms.update)
    .delete(rooms.delete);

module.exports = router;