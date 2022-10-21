const express = require('express');

const healtcheckCtrl = require(`${global.__base}/controllers/api/healthcheck/v1.0`);
const router = express.Router();

/*
  Health Check
*/

router.get('/', healtcheckCtrl.index);

module.exports = router;
