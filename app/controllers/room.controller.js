// Create and Save a new room
exports.create = async(req, res) => {
    res.send({ message: "create handle" });
};

// Retrieve all rooms of a user from the database
exports.findAll = async(req, res) => {
    res.send({ message: "findAll handle" });
};

// Find a single room with an id
exports.findOne = async(req, res) => {
    res.send({ message: "findOne handle" });
};

// Update a room by the id in the request
exports.update = async(req, res) => {
    res.send({ message: "update handle" });
};

// Delete a room with the specified id in the request
exports.delete = async(req, res) => {
    res.send({ message: "delete handle" });
};

// Delete all rooms of a user from the database
exports.deleteAll = async(req, res) => {
    res.send({ message: "deleteAll handle" });
};
