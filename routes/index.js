var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BandHub' });
});

router.get('/login', function(req, res, next) {
  // somehow redirect if user is logged in... hmmm

  res.render('login', { title: 'BandHub | Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'BandHub | Signup' });
});

router.get('/profile', function(req, res) {

  const sessionCookie = req.cookies.session || "";
  console.log(sessionCookie)
  admin.auth().verifySessionCookie(sessionCookie, true /**check if revoked */)
    .then(() => {
      res.render('profile', { title: 'BandHub | Profile' });
    })
    .catch((error) => {
      console.log("NOT LOGGED IN, REDIRECTING");
      res.redirect("/login")
    })
});

module.exports = router;
