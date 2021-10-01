const { responseCode, errorResponse, successResponse } = require('../utilities/helpers');
const bcrypt = require("bcrypt");
const hash = require("../utilities/bcrypt");
const generateToken = require("../utilities/jwt");
const userService = require("../services/user_service");

const { createUser, findUserByEmail } = userService;
module.exports = class userController {
  
  static async createUser (req, res) {
    try {
      const { email, password } = req.body;
      req.body.email = email.toLowerCase();
      const user = await findUserByEmail(req.body.email);
      if(user)return errorResponse(res, responseCode.BAD_REQUEST, 'user already exists.')
      req.body.password = await hash(password);
      const newUser = await createUser(req.body);
      const token = await generateToken({ id: newUser.id, email: req.body.email});
      return successResponse(res, responseCode.CREATED, 'user has been added.', {token});
    } catch (err) {
      console.log(err)
      return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
    }
  }

  static async signInUser (req, res) {
    try {
      const { email, password } = req.body;
      const user = await findUserByEmail(email);
      if(!user)return errorResponse(res, responseCode.BAD_REQUEST, 'user does not exist.');
      const validpass = await bcrypt.compare(password, user.password);
      if(!validpass)return errorResponse(res, responseCode.BAD_REQUEST, 'incorrect password.');
      const token = await generateToken({ id: user.id, email });
      return successResponse(res, responseCode.CREATED, 'user sign-in succussful.', {token});
    } catch (err) {
      console.log(err)
      return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
    }
  }

}
