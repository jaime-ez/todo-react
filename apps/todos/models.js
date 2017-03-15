var db = require('mongoose')

var ObjectId = db.Schema.ObjectId
var Schema = new (db.Schema)({
  title: {type: String, trim: true, required: true},
  done: {type: Boolean, default: false}
})

Schema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title,
    done: this.done
  }
}

Schema.statics.add = function (args, fn) {
  var item = new Todo(args)
  return item.save(fn)
}

Schema.statics.get = function (fn) {
  return Todo.find(fn)
}

Schema.statics.fetch = function (args, fn) {
  return Todo.findOne(args, fn)
}

Schema.statics.change = function (who, what, fn) {
  return Todo.findOneAndUpdate(who, what, fn)
}

Schema.statics.removelo = function (args, fn) {
  return Todo.remove(args, fn)
}

var Todo = db.model('Todo', Schema)
