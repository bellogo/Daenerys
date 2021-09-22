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
      "redirect_url": `${host}/payments/redirect_url`,
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
      if(callValidate.data.status === "successful") {
        await updateTransaction(flw_ref, callValidate.data.tx_ref, { status: callValidate.data.status });
        await creditAccount(req.decoded.email, callValidate.data.charged_amount);
      }
      return successResponse(res, responseCode.CREATED, 'Payment validated.');
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
    if(req.body.txRef && req.body.status === 'successful'){
    const transaction = await findBytx_ref(req.body.txRef);
    if(!transaction) res.end();
    // verify transaction
    const verifStatus = await axios.get(`https://api.flutterwave.com/v3/transactions/${req.body.id}/verify`, { headers: { 'Authorization': `Bearer ${flwSecKey}`} });
    if (verifStatus.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, verifStatus.response.data.message);
    if(verifStatus.data.data.status === "successful" && transaction.status !== "successful"){
      await updateTransaction(req.body.txRef, { status: req.body.status });
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
    const {status, tx_ref, transaction_id} = req.params;
    if(status === 'successful'){
    const callWebhook = await axios.post(`${host}/api/v1/payments/webhook`, {status, txRef: tx_ref, id: transaction_id}, { headers: { 'verif-hash': myHash} });
    if (callWebhook.data.status !== "success") return errorResponse(res, responseCode.BAD_REQUEST, callValidate.response.data.message);
    return successResponse(res, responseCode.CREATED, 'Payment verified.');
    }
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


}
