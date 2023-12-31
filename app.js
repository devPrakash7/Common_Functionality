var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');


const cookie = require('cookie-session');
const flash = require('connect-flash');

//swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const swaggerAdminDocument = require('./swaggerAdmin.json');


const indexRouter = require('./v1/routes/index');
const usersRouter = require('./v1/routes/users');
const countryRouter = require('./v1/routes/country');
const webRouter = require('./v1/routes/web')
const notificationRouter = require('./v1/routes/notification')
const cmsRouter = require('./v1/routes/cms')


const indexAdminRouter = require('./admin/routes/index');
const adminRouter = require('./admin/routes/admin');
const cmsAdminRouter = require('./admin/routes/cms');
const versionRouter = require('./admin/routes/version');
const emailTemplateRouter = require('./admin/routes/emailTemplate');
const smsTemplateRouter = require('./admin/routes/smsTemplate');


const contactUsRouter = require('./admin/routes/contactUs');
const commonFunction = require('./helper/commonFunction.helper');

var app = express();

// require('./cronJobs/removeOldData');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(flash());

app.use(
  cookie({
    // Cookie config, take a look at the docs...
    secret: 'I Love India...',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true
    },
  }),
);

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api-docs-admin', swaggerUi.serve, swaggerUi.setup(swaggerAdminDocument));

//Database connection with mongodb
const mongoose = require('./config/database');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/country', countryRouter);
// app.use('/v1/analytics', analyticRouter);
app.use('/v1/web', webRouter);
app.use('/v1/notification', notificationRouter);
app.use('/v1/cms', cmsRouter);

app.use('/v1/', indexAdminRouter);
app.use('/admin', adminRouter);
app.use('/cms', cmsAdminRouter);
app.use('/version', versionRouter);
app.use('/contactUs', contactUsRouter);
app.use('/emailTemplate', emailTemplateRouter);
app.use('/smsTemplate', smsTemplateRouter);


const script = require('./script/script')

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log("err..........", err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;