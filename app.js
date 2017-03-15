var express = require('express')
var config = require('./config')
var http = require('http')
var app = express()
var server = http.createServer(app)
var bodyParser = require('body-parser')

var port = 8080

config(app)
app.use(bodyParser.json())

var routes = [
  './apps/web/routes',
  './apps/todos/routes'
]

routes.forEach(function (path) {
  require(path)(app)
})

server.listen(port, function (err) {
  if (err) {
    console.error('Unable to listen for connections', err)
    process.exit(1)
  }

  console.log('running on port', port)
})
