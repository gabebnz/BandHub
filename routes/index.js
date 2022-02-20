var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BandHub' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'BandHub | Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'BandHub | Signup' });
});

module.exports = router;
