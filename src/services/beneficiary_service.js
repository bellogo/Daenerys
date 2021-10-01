const db = require("../sequelize/models");

module.exports = class beneficiaryService {
  
  static async addBeneficiary(beneficiary) {
    try {
      return await db.Beneficiaries.create(beneficiary);
    } catch (err) {
      throw err;
    }
  }

  static async getByAccountNumber(account_number) {
    try {
      return await db.Beneficiaries.findOne({ 
        where: {account_number}, 
      });    
    } catch (err) {
      throw err;
    }
  } 

  static async getById(id) {
    try {
      return await db.Beneficiaries.findOne({ 
        where: {id}, 
      });    
    } catch (err) {
      throw err;
    }
  } 

}
