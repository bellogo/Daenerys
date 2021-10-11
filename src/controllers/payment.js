const { responseCode, errorResponse, successResponse, generateRandomToken } = require('../utilities/helpers');
const bcrypt = require("bcrypt");
const open = require('open');
const axios = require('axios');
const config = require("../../config");
const userService = require("../services/user_service");
const transactionService = require("../services/transaction_service");
const { createTransaction, updateTransaction, findByflw_ref, findBytx_ref } = transactionService;
const { findUserByEmail } = userService;
const { creditAccount, debitAccount } = require("../services/account_service");
const beneficiaryService = require("../services/beneficiary_service");
const { getById } = beneficiaryService;
const { host, flwSecKey, flwEncKey, myHash} = config;

 // This is the encryption function that encrypts your payload by passing the stringified format and your encryption Key.
 function encrypt(key, text) {
  var forge = require("node-forge");
  var cipher = forge.cipher.createCipher(
  "3DES-ECB",
  forge.util.createBuffer(key)
  );
  cipher.start({ iv: "" });
  cipher.update(forge.util.createBuffer(text, "utf-8"));
  cipher.finish();
  var encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes());
}

module.exports = class paymentController {

  static async initiatePayment (req, res) {
    try {
    const user = await findUserByEmail(req.decoded.email);
    let axiosConfig = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${flwSecKey}`}, params: {
      'type': 'card'
    } };
    const { card_number, cvv, expiry_month, expiry_year, amount, pin } = req.body;
    const payload = {
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      "currency": "NGN",
      amount,
      "fullname": user.name,
      "email": user.email,
      "enckey": flwEncKey,
      "tx_ref": await generateRandomToken(),
    }  
   
      const callFlutterCharges = async ( payload, axiosConfig) => {
        const stringPayload = JSON.stringify(payload);
        const encrypted = encrypt(flwEncKey, stringPayload);
        return await axios.post('https://api.flutterwave.com/v3/charges', { "client": encrypted }, axiosConfig);
      }
      let flwResponse = await callFlutterCharges(payload, axiosConfig);
      if (flwResponse.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, flwResponse.response.message);
      if (flwResponse.data.meta.authorization.mode === 'redirect') {
        await createTransaction({
          userId: user.id,
          accountId: user.userAccount.id,
          tx_ref: payload.tx_ref,
          status: 'pending',
          payment_type: 'card',
          type: "credit",
          gateway: "flutterwave", 
          amount: payload.amount,
        });
        let url = response.meta.authorization.redirect;
        return open(url);
      }
      if(flwResponse.data.meta.authorization.mode === 'pin' && !pin) return errorResponse(res, responseCode.BAD_REQUEST, 'card pin is required.');
      if (flwResponse.data.meta.authorization.mode === 'pin') {
          let payload2 = payload;
          payload2.authorization = {
          "mode": "pin",
          "fields": [ "pin" ],
          pin
        }
      flwResponse = await callFlutterCharges(payload2, axiosConfig);
      if (flwResponse.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, flwResponse.data.message);
      await createTransaction({
        userId: user.id,
        accountId: user.userAccount.id,
        flw_ref: flwResponse.data.data.flw_ref,
        tx_ref: flwResponse.data.data.tx_ref,
        status: flwResponse.data.data.status,
        payment_type: flwResponse.data.data.payment_type,
        type: "credit",
        gateway: "flutterwave", amount: flwResponse.data.data.charged_amount,
      });
    }  
    return successResponse(res, responseCode.CREATED, 'Payment initiated.', { "flw_ref": flwResponse.data.data.flw_ref });
    } catch (err) {
      console.log(err);
      return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
    }
  }

  static async validatePayment (req, res) {
    try {
      const {otp, flw_ref} = req.body;
      const transaction = await findByflw_ref(flw_ref);
      if(transaction.status === "successful") return errorResponse(res, responseCode.BAD_REQUEST, 'Payment already validated.');
      const callValidate = await axios.post('https://api.flutterwave.com/v3/validate-charge', {otp, flw_ref}, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${flwSecKey}`} });
      if (callValidate.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, callValidate.response.data.message);
      return successResponse(res, responseCode.CREATED, 'Payment validated.', { "transaction_id": callValidate.data.data.id, "tx_ref": callValidate.data.data.tx_ref });
    } catch (err) {
      console.log(err);
      return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err);
    }

  }

  static async resolvePayment (req, res) {
  try {
  let hash = req.headers["verif-hash"];
  if(!hash) {
    res.end()
  }
  const secret_hash = myHash;  
  if(hash !== secret_hash) {
    res.end()
  }
    if(req.body.data.tx_ref && req.body.data.status === 'successful'){
    const transaction = await findBytx_ref(req.body.data.tx_ref);
    if(!transaction) res.end();
    // verify transaction
    const verifStatus = await axios.get(`https://api.flutterwave.com/v3/transactions/${req.body.data.id}/verify`, { headers: { 'Authorization': `Bearer ${flwSecKey}`} });
    if (verifStatus.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, verifStatus.response.data.message);
    if(verifStatus.data.data.status === "successful" && transaction.status !== "successful"){
      await updateTransaction(req.body.data.tx_ref, { status: req.body.data.status });
      await creditAccount(verifStatus.data.data.customer.email, verifStatus.data.data.charged_amount);
    }
  }
  res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err);
  }
 }

 static async verifyPayment (req, res) {
  try {
    const {tx_ref, transaction_id} = req.body;
    const transaction = await findBytx_ref(tx_ref);
    if(!transaction) return errorResponse(res, responseCode.BAD_REQUEST, 'transaction does not exist');
    if(transaction.status === "successful") return errorResponse(res, responseCode.BAD_REQUEST, 'Payment already verified.');
    const verifStatus = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, { headers: { 'Authorization': `Bearer ${flwSecKey}`} });
    if (verifStatus.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, verifStatus.response.data.message);
    if(verifStatus.data.data.status === "successful"){
      await updateTransaction(tx_ref, { status: "successful" });
      await creditAccount(verifStatus.data.data.customer.email, verifStatus.data.data.charged_amount);
    }    
    return successResponse(res, responseCode.CREATED, 'Payment verified.');
  } catch (err) {
    console.log(err);
    return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err);
  }

}

static async transferFunds (req, res) {
  try {
    const { to, amount, password } = req.body;
    req.body.to = to.toLowerCase();
    const receivingUser = await findUserByEmail(req.body.to);
    if(!receivingUser) return errorResponse(res, responseCode.BAD_REQUEST, 'user does not exists.');
    const user = await findUserByEmail(req.decoded.email);
    const validpass = await bcrypt.compare(password, user.password);
    if(!validpass)return errorResponse(res, responseCode.BAD_REQUEST, 'incorrect password.');
    if(amount > user.userAccount.balance) return errorResponse(res, responseCode.BAD_REQUEST, 'your balance is not enough for this transaction.');
    await debitAccount(user.email, amount);
    await createTransaction({
      userId: user.id,
      accountId: user.userAccount.id,
      status: 'successful',
      payment_type: 'transfer',
      type: "debit",
      transfer_to: req.body.to, 
      amount
    });
    await creditAccount(req.body.to, amount);
    await createTransaction({
      userId: receivingUser.id,
      accountId: receivingUser.userAccount.id,
      status: 'successful',
      payment_type: 'transfer',
      type: "credit",
      transfer_from: user.email, 
      amount
    });
    return successResponse(res, responseCode.CREATED, 'transfer successful.');
  } catch (err) {
    console.log(err)
    return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'An error occurred.', err)
  }
}

static async withdraw (req, res) {
  try {
    const user = await findUserByEmail(req.decoded.email);
    const { beneficiary_id, amount, narration, debit_currency} = req.body;
    const beneficiary = await getById(beneficiary_id);
    if(!beneficiary) return errorResponse(res, responseCode.BAD_REQUEST, 'beneficiary does not exist.');
    console.log("beneficiary.userId", beneficiary.userId);
    console.log("req.decoded.id", req.decoded.id);
    if(beneficiary.userId !== req.decoded.id) return errorResponse(res, responseCode.BAD_REQUEST, 'cannot withdraw to this beneficiary');
    if(amount > user.userAccount.balance) return errorResponse(res, responseCode.BAD_REQUEST, 'your balance is not enough for this transaction.');

    let axiosConfig = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${flwSecKey}`} };
    const payload = { 
    "account_bank": beneficiary.account_bank,
    "account_number": beneficiary.account_number,
    amount,
    narration,
    "currency": beneficiary.currency,
    "reference":  await generateRandomToken(),
    "callback_url": "http://2c7e-102-89-3-159.ngrok.io/api/v1/payments/webhook",
    debit_currency
    }
    const withdraw = await axios.post('https://api.flutterwave.com/v3/transfers', payload, axiosConfig);
    if (withdraw.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, withdraw.response.message); 
     await createTransaction({
      userId: user.id,
      accountId: user.userAccount.id,
      tx_ref: withdraw.data.data.reference,
      status: withdraw.data.data.status,
      payment_type: "withdrawal",
      type: "debit",
      gateway: "flutterwave", 
      amount: withdraw.data.data.amount + withdraw.data.data.fee,
    });

    return successResponse(res, responseCode.CREATED, 'withdraw initiated.', withdraw.data.data);
  } catch (error) {
    console.log(error);
  }

}
}
