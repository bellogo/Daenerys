const jwt = require("jsonwebtoken");
const config = require("../../config");

const { jwtKey } = config;

module.exports = (payload, secret = jwtKey) => {
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  return token;
};