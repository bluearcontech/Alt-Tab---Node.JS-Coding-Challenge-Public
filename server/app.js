'use strict'
let http = require('http')
let express = require('express')
let session = require('express-session')
let mongoose = require('mongoose')
let passport = require('passport')
let connectMongo = require('connect-mongo')
let bodyParser = require('body-parser')
let methodOverride = require('method-override')
let expressValidator = require('express-validator')
let serverConfig = require('./config/server')
let routes = require('./routes')
let projectConfig = require('../config/project.config')


// Connect to database.
// Connection should be established outside createServer()
// to be shared across server instances.
// Multiple server instances are created only when unit-testing.

// Plugging in native ES6 promises library.
mongoose.Promise = global.Promise
mongoose.connect(serverConfig.DB_URI)
mongoose.connection.once('openUri', () => {
  console.log('Connected to database.')
})
mongoose.connection.on('error', () => {
  console.log('DB connection error.')
  process.exit()
})

const MongoStore = connectMongo(session)


const createServer = (middlewares = []) => {
  // Create a server.
  const app = express()

  // Configure the server.
  app.set('port', projectConfig.port)

  app.use(bodyParser.json())

  app.use(methodOverride())
  app.use(expressValidator())

  // Configure the session
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: serverConfig.SESSION_SECRET,
    store: new MongoStore({
      url: serverConfig.DB_URI,
      autoReconnect: true,
    }),
  }))

  // Configure the passport middleware.
  app.use(passport.initialize())
  app.use(passport.session())

  // Apply middlewares passed as arguments.
  middlewares.forEach((middleware) => {
    app.use(middleware)
  })

  // For backend API.
  app.use('/api', routes)

  app.use(express.static(projectConfig.dir_app))
  app.use(express.static(projectConfig.dir_public))

  return app
}

module.exports = createServer
