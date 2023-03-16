const { ObjectId } = require("mongodb");

class BookingService {
    constructor(client) {
        this.Booking = client.db().collection("bookings");
    }

    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractBookingData(payload) {
        const booking = {
            room_id: payload.room_id,
            customer_id: payload.customer_id,
            checkin_date: payload.checkin_date,
            checkout_date: payload.checkout_date,
            num_of_guests: payload.num_of_guests,
            total_price : payload.total_price,
        };
        // Remove undefined fields
        Object.keys(booking).forEach(
            (key) => booking[key] === undefined && delete booking[key]
        );
        return booking;
    }

    async create(payload) {
        const booking = this.extractBookingData(payload);
        const result = await this.Booking.findOneAndUpdate(
            booking,
            { $set: booking },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Booking.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findById(id) {
        return await this.Booking.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }  

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractBookingData(payload);
        const result = await this.Booking.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Booking.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Booking.deleteMany({});
        return result.deletedCount;
    }

    async findAvailable() {
        return await this.find({ is_available: true });
    }
}

module.exports = BookingService;