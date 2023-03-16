const BookingService = require("../services/booking.service");
const RoomService = require("../services/room.service");
const CustomerService = require("../services/customer.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new booking
exports.create = async(req, res, next) => {
    if (!req.body?.room_id || !req.body?.customer_id || !req.body?.checkin_date || !req.body?.checkout_date || !req.body?.num_of_guests || !req.body?.total_price) {
        return next(new ApiError(400, "Field can not be empty"));
    }
    try {
        const bookingService = new BookingService(MongoDB.client);
        const roomService = new RoomService(MongoDB.client);
        const customerService = new CustomerService(MongoDB.client);
        
        const room = await roomService.findById(req.body.room_id);
        if (!room) {
            return next(new ApiError(404, "Invalid room ID"));
        }

        if (room.is_available == false) {
            return next(new ApiError(404, "Room is full"));
        } else {
            await roomService.updateAvailable(req.body.room_id)
        }

        const customer = await customerService.findById(req.body.customer_id);
        if (!customer) {
            return next(new ApiError(404, "Invalid customer ID"));
        }
        
        const document = await bookingService.create(req.body);
        return res.send(document);

    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the booking")
        );
    }
};

// Retrieve all bookings from the database
exports.findAll = async(req, res, next) => {
    let documents = [];

    try {
        const bookingService = new BookingService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await bookingService.findByName(name);
        } else {
            documents = await bookingService.find({});
        }
    } catch (error) {
        return next( 
            new ApiError(500, "An error occurred while retrieving bookings")
        );
    }

    return res.send(documents);
};

// Find a single booking with an id
exports.findOne = async(req, res, next) => {
    try {
        const bookingService = new BookingService(MongoDB.client);
        const document = await bookingService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Booking not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving booking with id=${req.params.id}`
            )
        );
    }
};

// Update a booking by the id in the request
exports.update = async(req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(
            400, "Data to update can not be empty")
        );
    }

    try {
        const bookingService = new BookingService(MongoDB.client);
        const document = await bookingService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Booking not found"));
        }
        return res.send({ message: "Booking was updated successfully"});
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error updating booking with id=${req.params.id}`
            )
        );
    }
};

// Delete a booking with the specified id in the request
exports.delete = async(req, res, next) => {
    try {
        const bookingService = new BookingService(MongoDB.client);
        const document = await bookingService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Booking not found"));
        }
        return res.send({ message: "Booking was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete booking with id=${req.params.id}`
            )
        );
    }
};

// Delete all bookings from the database
exports.deleteAll = async(req, res, next) => {
    try {
        const bookingService = new BookingService(MongoDB.client);
        const deleteCount = await bookingService.deleteAll();
        return res.send({
            message: `${deleteCount} bookings were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all bookings")
        );
    }
};


// Find all available bookings of a user
exports.findAllAvailable = async(req, res, next) => {
    try {
        const bookingService = new BookingService(MongoDB.client);
        const document = await bookingService.findAvailable();
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                "An error occurred while retrieving available bookings"
            )
        );
    }
};