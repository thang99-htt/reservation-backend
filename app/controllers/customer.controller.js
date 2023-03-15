const CustomerService = require("../services/customer.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new Customer
exports.create = async(req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name can not be empty"));
    }
    try {
        const customerService = new CustomerService(MongoDB.client);
        const document = await customerService.create(req.body);
        return res.send(document);

    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the customer")
        );
    }
};

// Retrieve all customers of a user from the database
exports.findAll = async(req, res, next) => {
    let documents = [];

    try {
        const customerService = new CustomerService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await customerService.findByName(name);
        } else {
            documents = await customerService.find({});
        }
    } catch (error) {
        return next( 
            new ApiError(500, "An error occurred while retrieving customers")
        );
    }

    return res.send(documents);
};

// Find a single customer with an id
exports.findOne = async(req, res, next) => {
    try {
        const customerService = new CustomerService(MongoDB.client);
        const document = await customerService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Customer not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving customer with id=${req.params.id}`
            )
        );
    }
};

// Update a customer by the id in the request
exports.update = async(req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(
            400, "Data to update can not be empty")
        );
    }

    try {
        const customerService = new CustomerService(MongoDB.client);
        const document = await customerService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Customer not found"));
        }
        return res.send({ message: "Customer was updated successfully"});
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error updating customer with id=${req.params.id}`
            )
        );
    }
};

// Delete a customer with the specified id in the request
exports.delete = async(req, res, next) => {
    try {
        const customerService = new CustomerService(MongoDB.client);
        const document = await customerService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Customer not found"));
        }
        return res.send({ message: "Customer was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete customer with id=${req.params.id}`
            )
        );
    }
};

// Delete all customers of a user from the database
exports.deleteAll = async(req, res, next) => {
    try {
        const customerService = new CustomerService(MongoDB.client);
        const deleteCount = await customerService.deleteAll();
        return res.send({
            message: `${deleteCount} customers were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all contacts")
        );
    }
};

