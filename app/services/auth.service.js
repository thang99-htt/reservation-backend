const { ObjectId } = require("mongodb");

class AuthService {
    constructor(client) {
        this.Admin = client.db().collection("admins");
    }
 
    async findByEmail(email) {
        return await this.Admin.findOne({email});
    } 
}


module.exports = AuthService;