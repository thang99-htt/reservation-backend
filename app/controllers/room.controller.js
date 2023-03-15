const RoomService = require("../services/room.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new room
exports.create = async(req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name can not be empty"));
    }
    try {
        const roomService = new RoomService(MongoDB.client);
        const document = await roomService.create(req.body);
        return res.send(document);

    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the room")
        );
    }
};

// Retrieve all rooms of a user from the database
exports.findAll = async(req, res, next) => {
    let documents = [];

    try {
        const roomService = new RoomService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await roomService.findByName(name);
        } else {
            documents = await roomService.find({});
        }
    } catch (error) {
        return next( 
            new ApiError(500, "An error occurred while retrieving rooms")
        );
    }

    return res.send(documents);
};

// Find a single room with an id
exports.findOne = async(req, res, next) => {
    try {
        const roomService = new RoomService(MongoDB.client);
        const document = await roomService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Room not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving room with id=${req.params.id}`
            )
        );
    }
};

// Update a room by the id in the request
exports.update = async(req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(
            400, "Data to update can not be empty")
        );
    }

    try {
        const roomService = new RoomService(MongoDB.client);
        const document = await roomService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Room not found"));
        }
        return res.send({ message: "Room was updated successfully"});
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error updating room with id=${req.params.id}`
            )
        );
    }
};

// Delete a room with the specified id in the request
exports.delete = async(req, res, next) => {
    try {
        const roomService = new RoomService(MongoDB.client);
        const document = await roomService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Room not found"));
        }
        return res.send({ message: "Room was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete room with id=${req.params.id}`
            )
        );
    }
};

// Delete all rooms of a user from the database
exports.deleteAll = async(req, res, next) => {
    try {
        const roomService = new RoomService(MongoDB.client);
        const deleteCount = await roomService.deleteAll();
        return res.send({
            message: `${deleteCount} rooms were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all rooms")
        );
    }
};
