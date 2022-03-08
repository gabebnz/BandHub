var express = require('express');
const { app } = require('firebase-admin');
var router = express.Router();
var admin = require("firebase-admin");

// MAIN ROUTES ----------------------------
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BandHub', authed: req.session.authed });
});

router.get('/home',getUser, function(req, res, next) {
  res.render('home', {title: 'Bandhub | Home', authed: req.session.authed, user:req.user})
});



// BAND POST ROUTES ------------------------------
router.get('/posts/new', sensitive, getUser, function(req, res, next) {
  res.render('createPost', {title:'Bandhub | Create Post', authed: req.session.authed, user:req.user})
})

router.get('/posts/:id', async function(req, res, next) {
  var postObj;
  var userObj;

  try{
    // Get post ID from the link
    await admin.firestore().collection('posts').doc(req.params.id).get()
    .then((data) => {
      postObj = data.data();
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(404); // no post with this id...
    })

    // get user info associated with post
    await admin.firestore().collection('users').doc(postObj.uid).get()
    .then((data) => {
      userObj = data.data();

      // We need to clean the user data so we arent sending private 
      // info (phone/email) to client side if not allowed
      if(postObj.phone != true){
        userObj.phone = null;
      }
      if(postObj.email != true){
        userObj.email = null;
      }

    })
    .catch((err) => {
      console.log("here")
      console.log(err)
      
      res.sendStatus(404); // user no longer exists..

    })
  }
  catch(e) {
    return res.sendStatus(404).render('error');;
  }
  

  res.render('post', {title:'Bandhub | ' + postObj.title, authed: req.session.authed, post: postObj, postUser:userObj})
})


// AUTH ROUTES --------------------------------
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'BandHub | Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'BandHub | Signup' });
});



// PROFILE ROUTES  --------------------------------
router.get('/profile',sensitive, getUser, function(req, res) {
  res.render('profile', { title: 'BandHub | Profile', authed: req.session.authed, user:req.user });
});

router.get('/profile/edit',sensitive,getUser, function(req, res) {
  res.render('editProfile', { title: 'BandHub | Edit Profile', authed: req.session.authed , user: req.user});
});






// AUTH FUNCTION ----------------
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

function getUser(req, res, next){
  if(!req.session.user){ // no user logged in, redirect to login.
    console.log("NOT LOGGED IN");
    req.user = null;
    next();
    return
  }

  admin.firestore().collection('users').doc(req.session.user.uid).get()
  .then((data) => {
    req.user = data.data();
    next();
  })
  .catch((err) => {
    console.log(err)
    req.user = null;
    next();
  })

  
}

module.exports = router;
