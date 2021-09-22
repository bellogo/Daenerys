const { Sequelize } = require('sequelize');
const config = require("../../config");

const { database, userName, password, host } = config;

const sequelize = new Sequelize(database, userName, password, {
  host: host,
  dialect: 'mysql'
});

const checkDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}


module.exports = checkDbConnection;