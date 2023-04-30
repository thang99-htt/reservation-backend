const { ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');

class CustomerService {
    constructor(client) {
        this.Customer = client.db().collection("customers");
    }

    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractCustomerData(payload) {
        const customer = {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          status: payload.status
        };
        if (payload.password) {
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(payload.password, salt);
          customer.password = hashedPassword;
        }
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

    async findByEmail(email) {
        return await this.Customer.findOne({email});
    } 

    async updateStatus(id) {
        const customerFilter = {
          _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const customer = await this.Customer.findOne(customerFilter);


        let newStatus;
        if (customer.status == 1) {
          newStatus = 0;
        } else if (customer.status == 0) {
          newStatus = 1;
        } 
      
        const update = { status: newStatus };
        const result = await this.Customer.findOneAndUpdate(
            customerFilter,
          { $set: update },
          { returnDocument: "after" }
        );
        return result.value;
    } 
}


module.exports = CustomerService;