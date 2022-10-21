const HttpStatus = require('http-status-codes');
const errors = require(`${global.__base}/middlewares/errors`);
// const mySqlDb = require(`${global.__base}/databases/mySqlDb`);

/**
 * HealthcheckController class that provide user controller methods.
 */
class HealthcheckController {
  /**
   * get channel info.
   * @param {req} req The express request.
   * @param {res} res The express response.
   * @param {function} next error handling function.
   */
  static async index(req, res, next) {
    try {
      // check mySqlDb connection.
      try {
        // await mySqlDb.mainDb.authenticate();
      } catch (err) {
        console.log(err);
        throw new errors.InternalServerError();
      }

      res.status(HttpStatus.OK).send('ok');
    } catch (exception) {
      next(exception);
    }
  }
}

module.exports = HealthcheckController;
