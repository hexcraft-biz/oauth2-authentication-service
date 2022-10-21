const HttpStatus = require('http-status-codes');
const url = require('url');
const errors = require(`${global.__base}/middlewares/errors`);
const hydraAdmin = require(`${global.__base}/libs/hydraClient`);
const urljoin = require(`${global.__base}/libs/url-join`);

/**
 * LogoutController class that provide logout methods.
 */
class LogoutController {
	/**
	 * Show up logout page.
	 * @param {req} req The express request.
	 * @param {res} res The express response.
	 * @param {function} next error handling function.
	 */
	static async view(req, res, next) {
		try {
			// Parses the URL query
			const query = url.parse(req.url, true).query

			// The challenge is used to fetch information about the login request from ORY Hydra.
			const challenge = query.logout_challenge
			if (challenge === undefined || challenge === "") {
				throw new errors.BadRequest("Expected a login challenge to be set but received none.");
			}

			hydraAdmin
				.getLogoutRequest(challenge)
			// This will be called if the HTTP request was successful
				.then(() => {
					// Here we have access to e.g. response.subject, response.sid, ...

					// The most secure way to perform a logout request is by asking the user if he/she really want to log out.
					res.render("logout", {
						csrfToken: req.csrfToken(),
						challenge: challenge,
						action: urljoin(process.env.BASE_URL || '', '/logout'),
					})
				})
			// This will handle any error that happens when making HTTP calls to hydra
				.catch(next)
		} catch (exception) {
			next(exception);
		}
	}

	/**
	 * Apply logout request.
	 * @param {req} req The express request.
	 * @param {res} res The express response.
	 * @param {function} next error handling function.
	 */
	static async apply(req, res, next) {
		try {
			// The challenge is now a hidden input field, so let's take it from the request body instead
			const challenge = req.body.challenge

			if (req.body.submit === "No") {
				return (
					hydraAdmin
					.rejectLogoutRequest(challenge)
					.then(() => {
						// The user did not want to log out. Let's redirect him back somewhere or do something else.
						res.redirect("/")
					})
					// This will handle any error that happens when making HTTP calls to hydra
					.catch(next)
				)
			}

			// The user agreed to log out, let's accept the logout request.
			hydraAdmin
				.acceptLogoutRequest(challenge)
				.then(({ data: body }) => {
					// All we need to do now is to redirect the user back to hydra!
					res.redirect(String(body.redirect_to))
				})
			// This will handle any error that happens when making HTTP calls to hydra
				.catch(next)
		} catch (exception) {
			next(exception);
		}
	}
}

module.exports = LogoutController;
