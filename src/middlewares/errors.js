const HttpStatus = require('http-status-codes');

/**
 * BadRequest class that handles 400 case.
 */
class BadRequest extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(message = 'The request was invalid.') {
    super();
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
  }
}

/**
 * Unauthorized class that handles 401 case.
 */
class Unauthorized extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(message = 'The authentication was failed.') {
    super();
    this.statusCode = HttpStatus.UNAUTHORIZED;
    this.message = message;
  }
}

/**
 * PaymentRequired class that handles 402 case.
 */
class PaymentRequired extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(message = 'Payment Required, quota exceeded.') {
    super();
    this.statusCode = HttpStatus.PAYMENT_REQUIRED;
    this.message = message;
  }
}

/**
 * Forbidden class that handles 403 case.
 */
class Forbidden extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(
    message = 'The client did not have permission to access the requested resource.'
  ) {
    super();
    this.statusCode = HttpStatus.FORBIDDEN;
    this.message = message;
  }
}

/**
 * NotFound class that handles 404 case.
 */
class NotFound extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(message = 'The requested resource was not found.') {
    super();
    this.statusCode = HttpStatus.NOT_FOUND;
    this.message = message;
  }
}

/**
 * Conflict class that handles 409 case.
 */
class Conflict extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(message = 'The requested resource had conflict.') {
    super();
    this.statusCode = HttpStatus.CONFLICT;
    this.message = message;
  }
}

/**
 * InternalServerError class that handles 500 case.
 */
class InternalServerError extends Error {
  /**
   * @param {string} message error message.
   */
  constructor(
    message = 'The request was not completed due to an internal error on the server side.'
  ) {
    super();
    this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    this.message = message;
  }
}

const handleError = (err, res) => {
  // TODO log err for internal.

  // set default status code & message.
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message =
    'The request was not completed due to an internal error on the server side.';

  if (typeof err.statusCode != 'undefined') {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    console.log(err);
  }

  res.status(statusCode).json({
    message,
  });
};

module.exports = {
  BadRequest,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
  Conflict,
  InternalServerError,
  handleError,
};
