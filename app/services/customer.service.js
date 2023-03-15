const { ObjectId } = require("mongodb");

class CustomerService {
    constructor(client) {
        this.Customer = client.db().collection("customers");
    }

    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractCustomerData(payload) {
        const customer = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
        };
        // Remove undefined fields
        Object.keys(customer).forEach(
            (key) => customer[key] === undefined && delete customer[key]
        );
        return customer;
    }

    async create(payload) {
        const customer = this.extractCustomerData(payload);
        const result = await this.Customer.findOneAndUpdate(
            customer,
            { $set: customer },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Customer.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findById(id) {
        return await this.Customer.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }  

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractCustomerData(payload);
        const result = await this.Customer.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Customer.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }
        
    

    async deleteAll() {
        const result = await this.Customer.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = CustomerService;