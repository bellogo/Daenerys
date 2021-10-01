const express = require("express");
const userController = require("./src/controllers/user");
// const paymentController = require("./src/controllers/payment");
const validations = require("./src/utilities/joi_validations");
const Authentication = require("./src/middleware/auth");
const paymentController = require("./src/controllers/payment");
const beneficiaryController = require("./src/controllers/beneficiary");


const { createUser, signInUser } = userController;
const { createBeneficiary } = beneficiaryController;

// const { initiatePayment, validateCharge, updatePayment } = paymentController;
const { initiatePayment, validatePayment, verifyPayment, resolvePayment, transferFunds, withdraw } = paymentController;


const { validateUser, validateCardDetails, validateTransactionDetails, validateTransferDetails, validateBeneficiaryDetails, validateWithdrawDetails } = validations;
const { verifyToken } = Authentication;

const router = express.Router();


// USER ROUTES
router.post("/user/signup",validateUser, createUser);
router.post("/user/signin",validateUser, signInUser);

router.post("/payments/card/initiatePayment", verifyToken, validateCardDetails, initiatePayment);
router.post("/payments/card/validatePayment", verifyToken, validateTransactionDetails, validatePayment);

router.post("/payments/webhook", resolvePayment);
router.post("/payments/verify", verifyPayment);

router.post("/user/transfer/", verifyToken, validateTransferDetails, transferFunds);
router.post("/create/beneficiary/", verifyToken, validateBeneficiaryDetails, createBeneficiary);
router.post("/beneficiary/withdraw", verifyToken, validateWithdrawDetails, withdraw);


module.exports = router;
