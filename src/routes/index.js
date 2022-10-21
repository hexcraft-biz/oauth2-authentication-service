const { handleError } = require(`${global.__base}/middlewares/errors`);

module.exports = (app) => {

	/*
   * Health check.
   */
	app.use('/healthcheck', require(`${global.__base}/routes/healthcheck`));

	/*
   * Authentication.
   */
	app.use('/', require(`${global.__base}/routes/authentication`));

  /*
   * errors handling middlewares.
   */
  app.use((err, req, res, next) => {
    handleError(err, res);
  });
};
