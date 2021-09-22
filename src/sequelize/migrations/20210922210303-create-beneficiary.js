'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Beneficiaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_bank: {
        type: Sequelize.STRING
      },
      account_number: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      narration: {
        type: Sequelize.STRING
      },
      callback_url: {
        type: Sequelize.STRING
      },
      debit_currency: {
        type: Sequelize.STRING
      },
      currency: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Beneficiaries');
  }
};