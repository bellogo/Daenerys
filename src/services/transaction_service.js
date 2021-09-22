const db = require("../sequelize/models");

module.exports = class transactionService {
  
  static async createTransaction(transaction) {
    try {
      return await db.Transactions.create(transaction);
    } catch (err) {
      throw err;
    }
  }

  static async updateTransaction(tx_ref, transaction) {
    try {
      return await db.Transactions.update(transaction, {
        where: { tx_ref }
      });
    } catch (err) {
      throw err;
    }
  }

  static async findByflw_ref(flw_ref) {
    try {
      return await db.Transactions.findOne({ 
        where: {flw_ref}, 
      });
    } catch (err) {
      throw err;
    }
  }

  static async findBytx_ref(tx_ref) {
    try {
      return await db.Transactions.findOne({ 
        where: {tx_ref}, 
      });
    } catch (err) {
      throw err;
    }
  }

}
