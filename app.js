var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var graph = require('fbgraph');

var routes = require('./routes/index');
var users = require('./routes/users');
var user = require('./routes/user');
var umenu = require('./routes/umenu');
var tip = require('./routes/tip');
var coupon = require('./routes/coupon');
var search = require('./routes/search');
var menu = require('./routes/menu');
var location = require('./routes/location');
var cafe = require('./routes/cafe');
var log = require('./logger');

var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use('/', routes);
app.use('/users', users);
app.use('/user', user);
app.use('/umenu', umenu);
app.use('/tip', tip);
app.use('/coupon', coupon);
app.use('/search', search);
app.use('/menu', menu);
app.use('/location', location);
app.use('/cafe', cafe);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var http = require('http');
app.set('port', 80); //80번 포트로 지정
var server = http.createServer(app);
server.listen(app.get('port'));
log.info('Port-->'+app.get('port'));

module.exports = app;
