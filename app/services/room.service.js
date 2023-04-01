const { ObjectId } = require("mongodb");

class RoomService {
    constructor(client) {
        this.Room = client.db().collection("rooms");
    }

    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractRoomData(payload) {
        const room = {
            name: payload.name,
            type: payload.type,
            price: payload.price,
            capacity: payload.capacity,
            is_available : payload.is_available,
        };
        // Remove undefined fields
        Object.keys(room).forEach(
            (key) => room[key] === undefined && delete room[key]
        );
        return room;
    }

    async create(payload) {
        const room = this.extractRoomData(payload);
        const result = await this.Room.findOneAndUpdate(
            room,
            { $set: { is_available : true } },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Room.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findByCapacity(capacity) {
        return await this.find({
            capacity: { $gte: parseInt(capacity) },
        });
    }

    async findByCapacityAndType(capacity, type) {
        return await this.find({
            capacity: { $gte: parseInt(capacity) },
            type: { $regex: new RegExp(type), $options: "i" },
        });
    }    

    async findById(id) {
        return await this.Room.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }   

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractRoomData(payload);
        const result = await this.Room.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async updateAvailable(id) {
        const room =  await this.Room.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        const result = await this.Room.findOneAndUpdate(
            room,
            { $set: {is_available: false} },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Room.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Room.deleteMany({});
        return result.deletedCount;
    }

    async findAvailable() {
        return await this.find({ is_available: true });
    }
}

module.exports = RoomService;