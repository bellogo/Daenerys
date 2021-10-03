const db = require("../sequelize/models");
// const accountService = require("./account_service");

module.exports = class userService {
  
  static async createUser(user) {
    try {
      const newUser = await db.Users.create(user);
      await db.Accounts.create({userId: newUser.id, balance: 0});
      return newUser;
    } catch (err) {
      throw err;
    }
  }

  static async findUserByEmail(email) {
    try {
      return await db.Users.findOne({ 
        where: {email}, 
        include: [{ model: db.Accounts, as: "userAccount" }, { model: db.Beneficiaries, as: "userBeneficiaries" }]
      });
    } catch (err) {
      throw err;
    }
  }
}