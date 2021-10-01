const Joi = require('joi')
const helpers = require('./helpers')

module.exports = class Validations {

  // USER VALIDATION
  static async validateUser (req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(255).empty(),
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "uk", "co"] } }).empty().required(),
      password: Joi.string().empty().required().min(3),
    })
    await helpers.validateRequest(req, res, next, schema)
  }
  
  static async validateCardDetails (req, res, next) {
    const schema = Joi.object({
      card_number: Joi.string().min(12).max(16).empty().required(),
      cvv: Joi.string().length(3).empty().required(),
      expiry_month: Joi.string().length(2).empty().required(),
      expiry_year: Joi.string().length(2).empty().required(),
      amount: Joi.string().empty().required().min(3),
      pin: Joi.string().empty().min(4)
    })
    await helpers.validateRequest(req, res, next, schema)
  }

  static async validateTransactionDetails (req, res, next) {
    const schema = Joi.object({
      flw_ref: Joi.string().length(41).empty().required(),
      otp: Joi.string().length(5).empty().required(),
    })
    await helpers.validateRequest(req, res, next, schema)
  }

  static async validateTransferDetails (req, res, next) {
    const schema = Joi.object({
      to: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "uk", "co"] } }).empty().required(),
      amount: Joi.string().empty().required().min(2),
      password: Joi.string().empty().required().min(3),
    })
    await helpers.validateRequest(req, res, next, schema)
  }

  static async validateBeneficiaryDetails (req, res, next) {
    const schema = Joi.object({
      account_bank: Joi.string().empty().required(),
      account_number: Joi.string().empty().required(),
      currency: Joi.string().empty().required(),
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "uk", "co"] } }).empty(),
      recipient_address: Joi.string().empty(),
      mobile_number: Joi.string().empty(),
    })
    await helpers.validateRequest(req, res, next, schema)
  }

  static async validateWithdrawDetails (req, res, next) {
    const schema = Joi.object({
      beneficiary_id: Joi.number().empty().required(),
      amount: Joi.number().empty().required(),
      narration: Joi.string().empty().required(),
      debit_currency: Joi.string().empty(),
    })
    await helpers.validateRequest(req, res, next, schema)
  }

}
