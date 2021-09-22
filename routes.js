const express = require("express");
const userController = require("./src/controllers/user");
// const paymentController = require("./src/controllers/payment");
const validations = require("./src/utilities/joi_validations");
const Authentication = require("./src/middleware/auth");
const paymentController = require("./src/controllers/payment");


const { createUser, signInUser } = userController;
// const { initiatePayment, validateCharge, updatePayment } = paymentController;
const { initiatePayment, validatePayment, verifyPayment, resolvePayment, transferFunds } = paymentController;


const { validateUser, validateCardDetails, validateTransactionDetails, validateTransferDetails } = validations;
const { verifyToken } = Authentication;

const router = express.Router();


// USER ROUTES
router.post("/user/signup",validateUser, createUser);
router.post("/user/signin",validateUser, signInUser);

router.post("/payments/card/initiatePayment", verifyToken, validateCardDetails, initiatePayment);
router.post("/payments/card/validatePayment", verifyToken, validateTransactionDetails, validatePayment);

router.post("/payments/webhook", resolvePayment);
router.get("/payments/redirect_url", verifyPayment);

router.post("/user/transfer/", verifyToken, validateTransferDetails, transferFunds);
router.post("/create/beneficiary/", verifyToken, validateTransferDetails, createBeneficiary);



module.exports = router;
