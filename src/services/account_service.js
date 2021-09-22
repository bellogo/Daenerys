const db = require("../sequelize/models");
const { returnInteger } = require("../utilities/helpers");
const userService = require("./user_service");


module.exports = class accountService {
  
  static async findById(id) {
    try {
      return await db.Accounts.findOne({ 
        where: {id}, 
      });
    } catch (err) {
      throw err;
    }
  }


  // static async createAccount(userId) {
  //   try {
  //     return await db.Accounts.create({userId, balance: 0});
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  static async creditAccount(email, amount) {
    try {
      const user = await userService.findUserByEmail(email);
      const newAmount = await returnInteger(amount);
      const newBalance = user.userAccount.balance + newAmount;
      await db.Accounts.update({ balance: newBalance}, {
        where: { id: user.userAccount.id }
      });
      return newBalance;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async debitAccount(email, amount) {
    try {
      const user = await userService.findUserByEmail(email);
      const newAmount = await returnInteger(amount);
      const newBalance = user.userAccount.balance - newAmount;
      await db.Accounts.update({ balance: newBalance}, {
        where: { id: user.userAccount.id }
      });
      return newBalance;
    } catch (err) {
      throw err;
    }
  }
}