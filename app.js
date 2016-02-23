'use strict'
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo/es5')(session)
const passport = require('passport')
const User = require('./models/User')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const hbs = require('hbs')
const components = require('./helpers/components')
const user = require('./helpers/user')

// imported just for side effects
require('./helpers/handlebars')

const app = express()

// setup env
dotenv.load({
  path: '.env'
})

// connect to mongo
const mongoURI = process.env.MONGODB
console.log('Connecting to MongoDB at ' + mongoURI)
mongoose.connect(mongoURI)

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + mongoURI)
})
mongoose.connection.on('error', function () {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.')
  process.exit(1)
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})

/* PRECOMPILE/MINIFY FILES */
components.compileAndMinify()

/* SETUP MIDDLEWARE */

// Session Setup
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: mongoURI,
    autoReconnect: true
  })
}))

// Auth Setup
app.use(passport.initialize())
app.use(passport.session())

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy())

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// view engine setup
const viewsDir = path.join(__dirname, 'views')
const partialsDir = path.join(viewsDir, 'partials')

app.set('view engine', 'hbs')
app.set('views', viewsDir)
hbs.registerPartials(partialsDir)

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// set up static file serving
app.use('/public', express.static(path.join(__dirname, components.publicFolder)))
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')))

/* SETUP ROUTES */
app.get('/', function (req, res, next) {
  res.render('index', {user: req.user})
})

require('./controllers/meetup/routes').attach(app)
app.use('/auth', require('./controllers/authenticate'))
app.use('/dump', require('./controllers/dump'))
app.use('/member', user.isAuthenticated, require('./controllers/member'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status = err.status || 500
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
