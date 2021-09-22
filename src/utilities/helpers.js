/**
 * import the configuration file
 */
// const config = require('../../');
const saltRounds = 10
const Joi = require('joi')
// const moment = require('moment')

/** *******************************
 *  Response Code Helpers
 ********************************* */
exports.responseCode = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOW: 405,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  ACCOUNT_NOT_VERIFIED: 209
}

/**
 *
 * @param {object} res response object
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 * @returns {object} res
 */
exports.successResponse = function (res, statusCode = this.responseCode.SUCCESS,
  message = 'success', data = null) {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  })
}

/**
 *
 * @param {object} res response object
 * @param {number} statusCode
 * @param {string} message
 * @param {*} errors
 * @returns {object} res
 */
exports.errorResponse = function (res, statusCode = this.responseCode.NOT_FOUND,
  message = 'error', errors = []) {
  res.status(statusCode).json({
    status: 'error',
    message,
    errors
  })
}

/** *******************************
 *  Paginator helper function
 *  TODO: Improve pagination
 ********************************* */

exports.pagination = function (limit) {
  return parseInt(limit || config.defaultRecordsPerPage)
}

exports.page = function (pageValue) {
  return parseInt(pageValue || config.defaultPage)
}

/** *******************************
 *  Validator helper function
 ********************************* */
exports.middleware = (schema, property) => (request, response, next) => {
  const { error } = schema.validate(request[property], {
    abortEarly: false,
    language: {
      key: '{{key}} '
    }
  })
  const valid = error == null
  if (valid) {
    next()
  } else {
    const { details } = error
    const errors = details.map(i => [i.message])
    this.errorResponse(response, this.responseCode.UNPROCESSABLE_ENTITY, 'Validation Error', errors)
  }
}

/**
 * The validation rule
 * @param req
 * @param res
 * @param next
 * @param schema
 */
exports.validateRequest = (req, res, next, schema) => {
  const FormattedError = []

  const options = {
    abortEarly: false, // include all errors
    allowUnknown: false // ignore unknown props
    // stripUnknown: true // remove unknown props
  }

  const { error, data } = Joi.validate(req.body, schema, options)
  if (error) {
    /**
         * loop through the error messages and return readable error message
         */
    error.details.forEach(e => {
      FormattedError.push(e.message.replace(/"/g, ''))
    })

    /**
         * returns a single error at a time
         */
    return this.errorResponse(
      res,
      this.responseCode.UNPROCESSABLE_ENTITY,
      'A validation error has occurred',
      FormattedError
    )
  }
  // req.body = req.body;

  return next()
}

/**
 * generate a random number
 */
exports.generateRandomToken = async (length = 16) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length

  /**
     * loop through the charLength defined
     */
  for (let i = 0; i < length; i++) {
    result += await characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

/**
 * hash passwords
 * @returns {Promise<void>}
 * @param password
 */
exports.hashPassword = async password => {
  const salt = await bcrypt.genSalt(saltRounds)
  return await bcrypt.hashSync(password, salt)
}


 exports.returnInteger = async string => {
  return integer = parseInt(string, 10);
}

/**
 * Send a mail
 * @param data
 * @returns {Promise<void>}
 */
exports.sendMail = async data => {
  const mail = require(`${__COMMON_MODULE}resources/Mail`)(data)
  mail.sendMail()
}



exports.isNotInPastDay = date => moment(date).diff(moment(), 'days') < 0

exports.isObjectEmpty = object => Object.entries(object).length === 0

exports.isInvalidPositiveInteger = item => !item || !Number.isInteger(+item) || item < 1

exports.removeObjectKeysWithNullValues = object => {
  for (const key in object) if (!object[key]) delete object[key]

  return object
}

exports.isValueInArray = (value, array) => array.indexOf(value) !== -1


exports.generateRandomString = length => {
  let result = ''
  const characters = '0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
