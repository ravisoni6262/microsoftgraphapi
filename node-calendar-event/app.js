var createError = require('http-errors');
var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var calendar = require('./routes/calendar');

var authorize = require('./routes/authorize');
var subscribe = require('./routes/subscribe');
var webhook = require('./routes/webhook');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var hbs = require('hbs');

hbs.registerHelper('trimString', function(passedString) {
	var newStr = passedString.replace(/=/g, "");
    var theString = newStr.substring(120);
    return new hbs.SafeString(theString)
});

var app = express();
//app.use(express.bodyParser());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/gohighlevel', indexRouter);
app.use('/users', usersRouter);
app.use('/calendar', calendar);
app.use('/authorize', authorize);
app.use('/subscribe', subscribe);
app.use('/webhook', webhook);
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
  res.render('error');
});

module.exports = app;
