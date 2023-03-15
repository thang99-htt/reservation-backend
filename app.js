const express = require("express");
const cors = require("cors");

const roomsRouter = require("./app/routes/room.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Hotel Reservation Booking App."});
});

app.use("/api/rooms", roomsRouter);

module.exports = app;