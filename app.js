var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');

//Firebase stuff
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json"); // make sure this isnt uploaded to git :)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bandhub-75fe2-default-rtdb.asia-southeast1.firebasedatabase.app"
});

var csrf = require('csurf');
const csrfMiddleware = csrf({ cookie: true });

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
app.use(csrfMiddleware);

app.all("*", (req, res, next) => { // Attatches csrf cookie token to all requests
  res.cookie("XSRF-TOKEN", req.csrfToken());
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
        const options = {maxAge: expiresIn, httpOnly: true, secure:true} // httponly so only backend can see this cookie
        res.cookie("session", sessionCookie, options)
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

app.use('/sessionLogout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
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
  res.redirect("/login");
});

module.exports = app;
