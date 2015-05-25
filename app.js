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

var redis = require('redis'); //redis
var RedisStore = require('connect-redis')(session);
var client = redis.createClient();
client.select(0);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUnitinialized: true,
  store: new RedisStore({
    host: 'localhost',
    port: 6739,
    ttl: 60*60,
    client: client
  })
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(require('express-domain-middleware'));

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

// app.use(function errorHandler(err, req, res, next) {
//   log.info('error on request %d %s %s', process.domain.id, req.method, req.url);
//   log.info(err.stack);
//   // res.send(500, "Something bad happened. :(");
//   // res.status(500).send("에러 발생 error = "+ err);
//   var temp = err.stack;
//   var error = temp.substring(0, temp.indexOf('\n'));
//   res.status(500).json({'error':error});
//   if(err.domain) {
//     //you should think about gracefully stopping & respawning your server
//     //since an unhandled error might put your application into an unknown state
//   }
// });

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

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
app.set('port', 30003); //80번 포트로 지정
var server = http.createServer(app);
server.listen(app.get('port'));
log.info('Port-->'+app.get('port'));

module.exports = app;
