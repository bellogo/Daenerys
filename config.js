// Import env package
require("dotenv").config({ silent: true, path: ".env" });

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  host: process.env.HOST,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  jwtKey : process.env.JWT_KEY,
  database : process.env.DB_NAME, 
  userName : process.env.DB_USER, 
  password : process.env.DB_PWD,
  host : process.env.DB_HOST,
  flwPubKey : process.env.PUBLIC_KEY,
  flwSecKey : process.env.SECRET_KEY,
  flwEncKey : process.env.ENCRYPTION_KEY,
  myHash : process.env.MY_HASH
};
