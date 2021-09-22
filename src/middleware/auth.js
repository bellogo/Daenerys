const jwt = require("jsonwebtoken");
const { responseCode, errorResponse } = require('../utilities/helpers');
const config = require('../../config');

const { jwtKey } = config;

module.exports = class Authentication {
  static async verifyToken (req, res, next) {
  try {
    const { authorization } = req.headers;
    let decoded;
    if (!authorization) return errorResponse(res, responseCode.BAD_REQUEST, 'Please input authorization token');
    const token = authorization.split(' ')[1];
    try {
      decoded = jwt.verify(token, jwtKey);
    } catch (error) {
      return errorResponse(res, responseCode.UNAUTHORIZED, 'Authentication failed.')
    }
    req.decoded = decoded;
    return next();   
  }catch (err){
    return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
  }
  }
}
