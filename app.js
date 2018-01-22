var express          = require('express');
var path             = require('path');
var favicon          = require('serve-favicon');
var logger           = require('morgan');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
const app            = express();
const mongoose       = require('mongoose');
const passport       = require('passport');
const expressSession = require('express-session');
const User           = require('./models/user');
const ENV            = require('./app-env');

// Mongoose Setup
mongoose.connect('mongodb://localhost:27017/google-authentication-app');

var index = require('./routes/index');
var users = require('./routes/users');

// Middleware
app.use(cookieParser());
app.use(expressSession({ secret: 'mySecretKey' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setting up the Passport Strategies
const googleClientKey = ENV.GOOGLE_CLIENT_ID;
const googleClientSecret = ENV.GOOGLE_CLIENT_SECRET;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

passport.use(new GoogleStrategy({
  clientID: googleClientKey,
  clientSecret: googleClientSecret,
  callbackURL: "http://127.0.0.1:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
      //check user table for anyone with a facebook ID of profile.id
      User.findOne({
          'google.id': profile.id 
      }, function(err, user) {
          if (err) {
              return done(err);
          }
          //No user was found... so create a new user with values from Facebook (all the profile. stuff)
          if (!user) {
              user = new User({
                  google: profile
              });
              user.save(function(err) {
                  if (err) console.log(err);
                  return done(err, user);
              });
          } else {
              //found user. Return
              return done(err, user);
          }
      });
  }
));

// Finish setting up the Sessions
passport.serializeUser(function(user, done) {
done(null, user);
});

passport.deserializeUser(function(user, done) {
done(null, user);
});

// -> Google
app.get('/auth/google', passport.authenticate('google', { scope: "email" }));

// <- Google
app.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: '/',
                                        failureRedirect: '/' }));

// Logout
app.get("/logout", function(req, res){
  req.session.destroy(function(e){
    req.logout();
    res.redirect("/");
  });
});

// Home page
app.get('/', function(req, res){
  res.render('login', {user: req.user});
});

app.listen(3300);

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
