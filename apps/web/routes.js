module.exports = function (app, passport) {
  app.get('/', function (req, res) {
    res.render('index.html', {
      title: 'Express.js & React Todos'
    })
  })
}
