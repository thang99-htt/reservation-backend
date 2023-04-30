const RoomService = require("../services/room.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new room
exports.create = async(req, res, next) => {
    if (!req.body?.name || !req.body?.type || !req.body?.price) {
        return next(new ApiError(400, "Field can not be empty"));
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

// Retrieve all rooms from the database
exports.findAll = async(req, res, next) => {
    
    try {
        let documents = [];
        const roomService = new RoomService(MongoDB.client);
        const { capacity, type, status } = req.query;
        if (capacity && type && status) {
            documents = await roomService.findByCapacityAndTypeAndStatus(capacity, type, status);
        } else if (capacity && type) {
            documents = await roomService.findByCapacityAndType(capacity, type);
        } else if (capacity && status) {
            documents = await roomService.findByCapacityAndStatus(capacity, status);
        } else if (type && status) {
            documents = await roomService.findByTypeAndStatus(type, status);
        } else if (capacity) {
            documents = await roomService.findByCapacity(capacity);
        } else if (type) {
            documents = await roomService.findByType(type);
        } else if (status) {
            documents = await roomService.findByStatus(status);
        } else {
            documents = await roomService.find({});
        }
        
        return res.send(documents);
    } catch (error) {
        return next( 
            new ApiError(500, "An error occurred while retrieving rooms")
        );
    }

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

// Update a room by the id in the request
exports.updateAvailable = async(req, res, next) => {
    try {
        const roomService = new RoomService(MongoDB.client);
        const document = await roomService.updateAvailable(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Room not found"));
        }
        return res.send({ message: document});
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

// Delete all rooms from the database
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


// Find all available rooms
exports.findAllAvailable = async(req, res, next) => {
    try {
        const roomService = new RoomService(MongoDB.client);
        const document = await roomService.findAvailable();
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                "An error occurred while retrieving available rooms"
            )
        );
    }
};
