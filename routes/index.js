var express = require('express');
const { app } = require('firebase-admin');
var router = express.Router();
var admin = require("firebase-admin");

// MAIN ROUTES ----------------------------
router.get('/', getPosts, getUser,function(req, res, next) {
  res.render('index', { title: 'BandHub', authed: req.session.authed, posts:req.posts, user:req.user});
});

router.get('/home',getUser, getPosts, function(req, res, next) {
  res.render('home', {title: 'Bandhub | Home', authed: req.session.authed, user:req.user, posts:req.posts})
});



// BAND POST ROUTES ------------------------------
router.get('/posts/new', sensitive, getUser, function(req, res, next) {
  res.render('createPost', {title:'Bandhub | Create Post', authed: req.session.authed, user:req.user})
})

router.get('/posts/:id', getUser, async function(req, res, next) {
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
    return res.sendStatus(404).render('error');
  }
  

  res.render('post', {title:'Bandhub | ' + postObj.title, authed: req.session.authed, post: postObj, postUser:userObj, user:req.user})
})


// AUTH ROUTES --------------------------------
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'BandHub | Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'BandHub | Signup' });
});



// PROFILE ROUTES  --------------------------------
router.get('/profile/edit',sensitive,getUser, function(req, res) {
  res.render('editProfile', { title: 'BandHub | Edit Profile', authed: req.session.authed , user: req.user});
});

router.get('/profile/:id', getUser, async function(req, res) {
  var userProfile;

  await admin.firestore().collection('users').doc(req.params.id).get()
  .then((data) => {
    userProfile = data.data();
  })
  .catch((err) => {
    console.log(err)
    res.sendStatus(404); // no post with this id...
  })

  res.render('profile', { title: 'BandHub | Profile', authed: req.session.authed, profile:userProfile, user: req.user});
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

// this will be a VERY slow function when there is lots of data...
// could probably be rewritten when I understand firebase better?
async function getPosts(req, res,next){
  const currTime = Date.now()
  const postAgeLimit =  currTime - 1209600000; // age limit (in ms) of post to get from database (set: 14 days)

  const dataArray = []; // temp array for some data objects
  const finalArray = []; // Main array to be set

  // Get posts younger or equal to 14 days old.
  const data = await admin.firestore().collection('posts').where('created', '>=', postAgeLimit).get()

  if(data.empty){
    console.log("NO POSTS FOUND...")
    next();
    return;
  }

  // Get data out of firebase object into array
  // Also sets the id parameter so we can link to it later...
  data.forEach(doc => {
    const Tdoc = doc.data();
    Tdoc.id = doc.id;

    dataArray.push(Tdoc)
  });

  //prepare data
  for(const dataObj of dataArray){
    dataObj.description= dataObj.description.slice(0,150) // limit only 150 chars going to post preview

    const user = await admin.firestore().collection('users').doc(dataObj.uid).get()

    if(user.empty){
      console.log("NO USER ACCOUNT FOUND FOR POST...")
      return; // this skips this iteration. Post will not be added to the list
    }
    
    dataObj.user = user.data().name

    // send data to array
    finalArray.push(dataObj);
  }

  finalArray.reverse();
  req.posts = finalArray;
  next();
}

module.exports = router;
