const config = require("../../../config");

const { database, userName, password, host } = config;

module.exports = {
  development: {
    username: userName,
    password: password,
    database: database,
    host: host,
    dialect: 'mysql',
  },
  test: {
    username: 'database_dev',
    password: 'database_dev',
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'database_dev',
    password: 'database_dev',
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'mysql',
  }
};