var express = require('express');
const { app } = require('firebase-admin');
var router = express.Router();
var admin = require("firebase-admin");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BandHub', authed: req.app.locals.authed  });
});

router.get('/login', function(req, res, next) {
  // somehow redirect if user is logged in... hmmm
  res.render('login', { title: 'BandHub | Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'BandHub | Signup' });
});

router.get('/profile',sensitive, function(req, res) {

  console.log(req.app.locals.user)
  res.render('profile', { title: 'BandHub | Profile', authed: req.app.locals.authed , user: req.app.locals.user});
});


function sensitive(req, res, next){
  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true /**check if revoked */)
    .then(() => {
      res.app.locals.authed = true;
      next();
    })
    .catch((error) => {
      res.app.locals.authed = false;
      console.log("NOT LOGGED IN, REDIRECTING");
      res.redirect("/")
    })
}

module.exports = router;
