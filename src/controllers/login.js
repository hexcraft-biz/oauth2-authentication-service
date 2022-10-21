const HttpStatus = require('http-status-codes');
const url = require('url');
const errors = require(`${global.__base}/middlewares/errors`);
const hydraAdmin = require(`${global.__base}/libs/hydraClient`);
const urljoin = require(`${global.__base}/libs/url-join`);
const oAuth2ClientCredentials = require(`${global.__base}/libs/clientCredentials`);
const axios = require('axios');

/**
 * LoginController class that provide login methods.
 */
class LoginController {
	/**
	 * Show up login page.
	 * @param {req} req The express request.
	 * @param {res} res The express response.
	 * @param {function} next error handling function.
	 */
	static async view(req, res, next) {
		try {
			// Parses the URL query
			const query = url.parse(req.url, true).query

			// The challenge is used to fetch information about the login request from ORY Hydra.
			const challenge = query.login_challenge
			if (challenge === undefined || challenge === "") {
				throw new errors.BadRequest("Expected a login challenge to be set but received none.");
			}

			hydraAdmin
				.getLoginRequest(challenge)
				.then(({ data: body }) => {
					// If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
					// the user.
					if (body.skip) {
						// You can apply logic here, for example update the number of times the user logged in.
						// ...

						// Now it's time to grant the login request. You could also deny the request if something went terribly wrong
						// (e.g. your arch-enemy logging in...)
						return hydraAdmin
							.acceptLoginRequest(challenge, {
								// All we need to do is to confirm that we indeed want to log in the user.
								subject: String(body.subject),
							})
							.then(({ data: body }) => {
								// All we need to do now is to redirect the user back to hydra!
								res.redirect(String(body.redirect_to))
							})
					}

					// If authentication can't be skipped we MUST show the login UI.
					res.render("login", {
						csrfToken: req.csrfToken(),
						challenge: challenge,
						action: urljoin(process.env.BASE_URL || '', '/login'),
						hint: body.oidc_context?.login_hint || "",
					})
				})
			// This will handle any error that happens when making HTTP calls to hydra
				.catch(next)
		} catch (exception) {
			next(exception);
		}
	}

	/**
	 * Apply login request.
	 * @param {req} req The express request.
	 * @param {res} res The express response.
	 * @param {function} next error handling function.
	 */
	static async apply(req, res, next) {
		try {
			// The challenge is now a hidden input field, so let's take it from the request body instead
			const challenge = req.body.challenge

			if (req.body.submit === "Deny access") {
				// Looks like the consent request was denied by the user
				return (
					hydraAdmin
					.rejectLoginRequest(challenge, {
						error: "access_denied",
						error_description: "The resource owner denied the request",
					})
					.then(({ data: body }) => {
						// All we need to do now is to redirect the browser back to hydra!
						res.redirect(String(body.redirect_to))
					})
					// This will handle any error that happens when making HTTP calls to hydra
					.catch(next)
				)
			}

			// Let's check if the user provided valid credentials. Of course, you'd use a database or some third-party service
			// for this!
			const accessToken = await oAuth2ClientCredentials.getToken();

			try {
				const params = {
					"identity": req.body.email,
					"password": req.body.password
				}
				const headers = {
					headers: {
						'content-type': 'application/json',
						'User-Agent': 'request',
						'Authorization': 'Bearer ' + accessToken, // for production
						'X-Kmk-Client-Id': 'client_id', // TODO only for dev
						'X-Kmk-Client-Scope': 'user.prototype', // TODO only for dev
					}
				}

				const loginUrl = process.env.USER_RESOURCE_URL + "auth/v1/login"
				const resp = await axios.post(loginUrl, params, headers);

				const user = {
					id: resp.data.id,
					email: resp.data.identity,
					status: resp.data.status,
				}

				// store to session
				req.session.user = user;

				// Seems like the user authenticated! Let's tell hydra...
				hydraAdmin
					.getLoginRequest(challenge)
					.then(({ data: loginRequest }) =>
						hydraAdmin
						.acceptLoginRequest(challenge, {
							// Subject is an alias for user ID. A subject can be a random string, a UUID, an email address, ....
							subject: user.email,

							// This tells hydra to remember the browser and automatically authenticate the user in future requests. This will
							// set the "skip" parameter in the other route to true on subsequent requests!
							remember: Boolean(req.body.remember),

							// When the session expires, in seconds. Set this to 0 so it will never expire.
							remember_for: 3600,

							// Sets which "level" (e.g. 2-factor authentication) of authentication the user has. The value is really arbitrary
							// and optional. In the context of OpenID Connect, a value of 0 indicates the lowest authorization level.
							// acr: '0',
							//
							// If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
							// the app is built for the automated OpenID Connect Conformity Test Suite. You
							// can peak inside the code for some ideas, but be aware that all data is fake
							// and this only exists to fake a login system which works in accordance to OpenID Connect.
							//
							// If that variable is not set, the ACR value will be set to the default passed here ('0')
							acr: '0',
						})
						.then(({ data: body }) => {
							// All we need to do now is to redirect the user back to hydra!
							res.redirect(String(body.redirect_to))
						}),
					)
				// This will handle any error that happens when making HTTP calls to hydra
					.catch(next)

				// You could also deny the login request which tells hydra that no one authenticated!
				// hydra.rejectLoginRequest(challenge, {
				//   error: 'invalid_request',
				//   errorDescription: 'The user did something stupid...'
				// })
				//   .then(({body}) => {
				//     // All we need to do now is to redirect the browser back to hydra!
				//     res.redirect(String(body.redirectTo));
				//   })
				//   // This will handle any error that happens when making HTTP calls to hydra
				//   .catch(next);
			} catch (err) {
				// Handle Error Here
				let errorMsg = "Something is wrong.";

				if (err.response) {

					if (err.response.status !== 500) {
						errorMsg = "The username / password combination is not correct.";
					}
				}

				res.render("login", {
					csrfToken: req.csrfToken(),
					challenge: challenge,
					error: errorMsg,
				})

				return
			}

		} catch (exception) {
			next(exception);
		}
	}
}

module.exports = LoginController;
