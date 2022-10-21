const { ClientCredentials } = require('simple-oauth2');

const config = {
  client: {
    id: process.env.APP_CLIENT_ID,
    secret: process.env.APP_CLIENT_SECRET,
  },
  auth: {
    tokenHost: process.env.HYDRA_PUBLIC_URL,
    tokenPath: '/oauth2/token',
  },
  options: {
    bodyFormat: "form",
    authorizationMethod: "body"
  }
};


class OAuth2ClientCredentials {
	static async getToken(req, res, next) {
		let token = null;
		// get token from redis 
		// if no, gen token & store to redis with TTL.
		token = await genToken();
		// if yes, return token. 
		return token;
	}
}

async function genToken() {
  const client = new ClientCredentials(config);

  const tokenParams = {
    scope: 'user.prototype',
  };

  try {
    const accessToken = await client.getToken(tokenParams);
		return accessToken.token.access_token
  } catch (error) {
    console.log('Access Token error', error.message);
  }
}

module.exports = OAuth2ClientCredentials;
