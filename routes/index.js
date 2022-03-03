var express = require('express');
const { app } = require('firebase-admin');
var router = express.Router();
var admin = require("firebase-admin");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BandHub', authed: req.session.authed });
});

router.get('/login', function(req, res, next) {

  //check if user cookie exists
  if(req.session.user){
    console.log("User session exists on server");
  }
  else{
    console.log("No User session exists on server");
  }

  // somehow redirect if user is logged in... hmmm
  res.render('login', { title: 'BandHub | Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'BandHub | Signup' });
});

router.get('/profile',sensitive, function(req, res) {
  res.render('profile', { title: 'BandHub | Profile', authed: req.session.authed , user: req.session.user});
});


router.get('/profile/edit',sensitive, function(req, res) {
  res.render('editProfile', { title: 'BandHub | Edit Profile', authed: req.session.authed , user: req.session.user});
});


function sensitive(req, res, next){

  if(!req.session.user){ // no user logged in, redirect to login.
    console.log("NOT LOGGED IN, REDIRECTING");
    res.redirect("/login")
    return;
  }

  const sessionCookie = req.cookies.session || "";
  admin.auth().verifySessionCookie(sessionCookie, true /**check if revoked */)
    .then(() => {
      req.session.authed = true; // reaffirm this... sometimes gets cleared?
      next();
    })
    .catch((error) => {
      res.redirect("/sessionLogout");
      console.log("NOT LOGGED IN, REDIRECTING");
      res.redirect("/login")
    })
}

module.exports = router;
