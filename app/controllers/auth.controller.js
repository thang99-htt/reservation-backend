const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async(req, res, next) => {
  if (!req.body?.email || !req.body?.password) {
      return next(new ApiError(400, "Field can not be empty."));
  }

  try {
      const authService = new AuthService(MongoDB.client);
      const admin = await authService.findByEmail(req.body.email);
      if (!admin) {
        return next(new ApiError(404, "User not found."));
      }
      const match = await bcrypt.compare(req.body.password, admin.password);
      
      if (!match) {
        return next(new ApiError(401, 'Email or password is incorrect'));
      } else {
        const token = jwt.sign({ id: admin._id }, 'privateKey');
        admin.token = token;
        return res.send(admin);
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
