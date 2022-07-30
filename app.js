var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var session = require('express-session');

//Firebase stuff
var admin = require("firebase-admin");



var serviceAccount = require("./serviceAccountKey.json"); // make sure this isnt uploaded to git :)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bandhub-75fe2-default-rtdb.asia-southeast1.firebasedatabase.app"
});

admin.firestore().settings({
  ignoreUndefinedProperties:true, // If data doesnt exist firebase wont throw error
})

var csrf = require('csurf');
const csrfMiddleware = csrf({ cookie: true});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"fat secret <- maybe change lmao", sameSite:'lax', secure:true}));
app.use(csrfMiddleware);

app.all("*", (req, res, next) => { // Attatches csrf cookie token to all requests
  const options = { sameSite: 'lax'} // httponly so only backend can see this cookie
  res.cookie("XSRF-TOKEN", req.csrfToken(), options);
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);


// Session cookie set when login <- shit name change it
app.post("/sessionLogin", (req,res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin.auth().createSessionCookie(idToken, {expiresIn})
    .then((sessionCookie) => {
        res.clearCookie('session'); // incase user logs in while already logged in...
        const options = {maxAge: expiresIn, httpOnly: true, secure:true, sameSite: 'lax'} // httponly so only backend can see this cookie
        res.cookie("session", sessionCookie, options)

        req.session.user = req.body.user;
        req.session.authed = true;
        
        res.end(JSON.stringify({status:"success"}))
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!")
      }
    )
    .catch((err) =>{
      console.log(err.message)
    })
})

app.post("/createAccount", (req, res) => {
  const user = req.body.user;

  admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    created: Date.now()
  })
  .then(() =>{
    res.end(JSON.stringify({status:"success"}))
  })
  .catch((err) => {
    console.log(err.message)
  })
})

app.post("/submitEdit", (req,res) => {
  const user = req.body.userData;
  const collection = admin.firestore().collection('users')

  collection.doc(req.session.user.uid).set({
    name: user.name,
    description: user.description,
    artists: user.artists,
    phone: user.phone,

    spotify: user.spotify,
    soundcloud: user.soundcloud,
    otherLink: user.otherLink
  }, {merge:true})
  .then(() =>{
    res.end(JSON.stringify({status:"success"}))
  })
  .catch((err) => {
    console.log(err.message)
  })
})

app.post("/submitPost", (req,res) => {
  const data = req.body.postData;
  admin.firestore().collection('posts').add({
    uid: data.uid,
    title: data.title,
    description: data.description,
    location: data.location,

    phone: data.phone,
    email: data.email,

    created: Date.now(),
  })
  .then((data) =>{
    res.send({PID:data.id})
  })
  .catch((err) => {
    console.log(err.message)
  })
})

app.use('/sessionLogout', (req, res) => {
  res.clearCookie('session');
  req.session.user = null;
  req.session.authed = false;
  res.redirect('/login');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  console.log("ERROR HANDLER: ", err)
  res.redirect("/");
});

module.exports = app;
