var db = require('mongoose')
var Todo = db.model('Todo')

module.exports = function (app) {
  app.route('/todos')
    .post(function (req, res) {
      Todo.add(req.body, function (err, item) {
        if (err) {
          res.sendStatus(500)
        } else {
          res.json(item)
        }
      })
    })
    .get(function (req, res) {
      Todo.get(function (err, items) {
        if (err) {
          res.sendStatus(500)
        } else {
          res.json(items)
        }
      })
    })

  app.route('/todos/:id')
    .get(function (req, res) {
      Todo.fetch({_id: req.params.id}, function (err, item) {
        if (err) {
          res.sendStatus(500)
        } else {
          res.json(item)
        }
      })
    })
    .put(function (req, res) {
      delete req.body.id
      Todo.change({_id: req.params.id}, req.body, function (err, item) {
        if (err) {
          res.sendStatus(500)
        } else {
          res.json(item)
        }
      })
    })
    .delete(function (req, res) {
      console.log('acaaaa', req.params.id)
      Todo.removelo({_id: req.params.id}, function (err, item) {
        if (err) {
          res.sendStatus(500)
        } else {
          res.sendStatus(200)
        }
      })
    })
}
