const { Configuration, AdminApi } = require("@ory/hydra-client");

const baseOptions = {}

if (process.env.MOCK_TLS_TERMINATION) {
  baseOptions.headers = { "X-Forwarded-Proto": "https" }
}

const configuration = new Configuration({
  basePath: process.env.HYDRA_ADMIN_URL,
  baseOptions,
})

const hydraAdmin = new AdminApi(configuration)

module.exports = hydraAdmin;
