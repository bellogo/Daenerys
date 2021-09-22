const db = require("../sequelize/models");

module.exports = class beneficiaryService {
  
  static async createBeneficiary(beneficiary) {
    try {
      return await db.Beneficiaries.create(beneficiary);
    } catch (err) {
      throw err;
    }
  }

}
