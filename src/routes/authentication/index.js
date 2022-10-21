const express = require('express');
const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
})

const router = express.Router();
const loginCtrl = require(`${global.__base}/controllers/login`);
const consentCtrl = require(`${global.__base}/controllers/consent`);
const logoutCtrl = require(`${global.__base}/controllers/logout`);

/*
  Index Page
*/
router.get("/", (req, res) => {
  res.render("index")
})

/*
  Login Page
*/
router.get("/login", csrfProtection, loginCtrl.view);
router.post("/login", csrfProtection, loginCtrl.apply);

/*
  Consent Page
*/
router.get("/consent", csrfProtection, consentCtrl.view);
router.post("/consent", csrfProtection, consentCtrl.apply);

/*
  Logout Page
*/
router.get("/logout", csrfProtection, logoutCtrl.view);
router.post("/logout", csrfProtection, logoutCtrl.apply);

/*
  Signup Page
*/
// router.get('/signup', healtcheckCtrl.index);
// router.post('/signup', healtcheckCtrl.index);

module.exports = router;
