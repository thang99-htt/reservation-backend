const { ObjectId } = require("mongodb");

class BookingService {
    constructor(client) {
        this.Booking = client.db().collection("bookings");
        this.Room = client.db().collection("rooms");
    }

    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractBookingData(payload) {
        const booking = {
            room_id: new ObjectId(payload.room_id),
            customer_id: new ObjectId (payload.customer_id),
            checkin_date: payload.checkin_date,
            checkout_date: payload.checkout_date,
            num_of_guests: payload.num_of_guests,
            total_price : payload.total_price,
            paid: payload.paid,
            status : payload.status,
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

    // async find(filter) {
    //     const cursor = await this.Booking.find(filter);
    //     return await cursor.toArray();
    // }

    async find(filter) {
        const cursor = await this.Booking.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "room_id",
                    foreignField: "_id",
                    as: "room",
                },
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customer_id",
                    foreignField: "_id",
                    as: "customer",
                }
            },
            {
                $unwind: "$room"
            },
            {
                $unwind: "$customer"
            },
            {
                $project: {
                    "_id": 1,
                    "customer_id": 1,
                    "checkin_date": 1,
                    "checkout_date": 1,
                    "num_of_guests": 1,
                    "total_price": 1,
                    "paid": 1,
                    "status": 1,
                    "room_type": "$room.type",
                    "room_name": "$room.name",
                    "room_capacity": "$room.capacity",
                    "room_price": "$room.price",
                    "customer_name": "$customer.name",
                    "customer_email": "$customer.email",
                    "customer_phone": "$customer.phone"
                }
            }
        ]);
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

    async updateStatus(id) {
        const bookingFilter = {
          _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const booking = await this.Booking.findOne(bookingFilter);

        const roomFilter = {
            _id: ObjectId.isValid(booking.room_id) ? new ObjectId(booking.room_id) : null,
        };

        const room = await this.Room.findOne(roomFilter);

        let newStatus;
        let newPaid = false;
        let isAvailable = false;
        if (booking.status === "Đang chờ xử lý") {
          newStatus = "Đã duyệt";
        } else if (booking.status === "Đã duyệt") {
          newStatus = "Đang sử dụng";
        } else if (booking.status === "Đang sử dụng") {
          newStatus = "Đã hoàn thành";
          newPaid = true;
          isAvailable = true;
        } 
      
        const update = { paid: newPaid, status: newStatus };
        const update1 = { is_available: isAvailable };
        const result = await this.Booking.findOneAndUpdate(
          bookingFilter,
          { $set: update },
          { returnDocument: "after" }
        );
        const result1 = await this.Room.findOneAndUpdate(
            roomFilter,
            { $set: update1 },
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

    async findBookingByUser(id) {
        const bookingFilter = {
            customer_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
          };
        return await this.find(bookingFilter);
    } 

    async cancleBooking(id) {
        const bookingFilter = {
          _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const booking = await this.Booking.findOne(bookingFilter);

        const roomFilter = {
            _id: ObjectId.isValid(booking.room_id) ? new ObjectId(booking.room_id) : null,
        };

        const room = await this.Room.findOne(roomFilter);

        let newStatus = "Đã hủy";
        let isAvailable = true;
        
        const update = { status: newStatus };
        const update1 = { is_available: isAvailable };

        const result = await this.Booking.findOneAndUpdate(
          bookingFilter,
          { $set: update },
          { returnDocument: "after" }
        );
        
        const result1 = await this.Room.findOneAndUpdate(
            roomFilter,
            { $set: update1 },
            { returnDocument: "after" }
        );
        return result.value;
      }
}

module.exports = BookingService;