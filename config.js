var express = require('express')
var db = require('mongoose')
var path = require('path')
var util = require('util')
var fs = require('fs')

module.exports = exports = function (app) {
  /*
    MongoDb configuration
  */
  var DATABASE_HOST,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD

  switch (app.settings.env) {
    case 'production':
      DATABASE_HOST = process.env.DATABASE_HOST
      DATABASE_NAME = process.env.DATABASE_NAME
      DATABASE_USER = process.env.DATABASE_USER
      DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
      break

    case 'development':
      DATABASE_HOST = 'localhost'
      DATABASE_NAME = 'db'
      break

    default:
      break
  }

  var DATABASE_URL = util.format(
    'mongodb://%s/%s', DATABASE_HOST, DATABASE_NAME)

  var connect = function () {
    var options = {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    }

    if (DATABASE_USER && DATABASE_PASSWORD) {
      options.user = DATABASE_USER
      options.password = DATABASE_PASSWORD
    }

    db.connect(DATABASE_URL, options)
  }

  connect()

  db.connection.on('error', function (err) {
    console.log(err)
  })

  db.connection.on('disconnected', function () {
    connect()
  })

   /*
    Loading models
   */

  var apps = path.resolve('./apps/')
  fs.readdirSync(apps).forEach(function (app) {
    var models = path.join(apps, app, 'models.js')

    if (fs.existsSync(models)) {
      require(models)
    }
  })

  /*
    Adding favicon and serving compressed static files
  */
  app.use(express.static(path.join(__dirname, 'public')))

  /*
    Configuring views dir and engine
  */
  app.set('views', path.join(__dirname, 'views'))
  app.engine('html', require('ejs').renderFile)
}
