const { responseCode, errorResponse, successResponse } = require('../utilities/helpers');
const beneficiaryService = require("../services/beneficiary_service");
const { addBeneficiary, getByAccountNumber } = beneficiaryService;

module.exports = class beneficiaryController {

static async createBeneficiary(req, res) {
  try {
    req.body.userId = req.decoded.id;
    const savedBeneficiary = await getByAccountNumber(req.body.account_number);
    if(savedBeneficiary) return errorResponse(res, responseCode.BAD_REQUEST, 'beneficiary already exists.');        
    return successResponse(res, responseCode.CREATED, 'beneficiary has been added.', await addBeneficiary(req.body));
  } catch (err) {
    console.log(err);
    return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
  }
}

}