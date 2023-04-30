const CustomerService = require("../services/customer.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create and Save a new Customer
exports.create = async(req, res, next) => {
    if (!req.body?.name || !req.body?.email || !req.body?.phone || !req.body?.password) {
        return next(new ApiError(400, "Field can not be empty"));
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

// Retrieve all customers from the database
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

// Delete all customers from the database
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

// Login
exports.login = async(req, res, next) => {
    if (!req.body?.email || !req.body?.password) {
        return next(new ApiError(400, "Field can not be empty."));
    }

    try {
        const customerService = new CustomerService(MongoDB.client);
        const customer = await customerService.findByEmail(req.body.email);
        if (!customer) {
            return next(new ApiError(404, "Customer not found."));
        }
        const match = await bcrypt.compare(req.body.password, customer.password);
          
        if (!match) {
            return next(new ApiError(401, 'Email or password is incorrect'));
        } else if (customer.status == 0) {
            return next(new ApiError(401, 'Account is temporarily locked'));
        } else {
            const token = jwt.sign({ id: customer._id }, 'privateKey');
            customer.token = token;
            return res.send(customer);
        }
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error login with email=${req.body.email}`
            )
        );
    }
};

// Update a customer by the id in the request
exports.updateStatus = async(req, res, next) => {
    try {
        const customerService = new CustomerService(MongoDB.client);
        const document = await customerService.updateStatus(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Customer not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error updating customer with id=${req.params.id}`
            )
        );
    }
};