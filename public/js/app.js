/** @jsx React.DOM */
// addons

var List = React.createClass({
  getInitialState: function () {
    return { items: []}
  },

  componentDidMount: function () {
    $.get(this.props.source, function (result) {
      var items = {}
      result.map(function (item) {
        items[item.id] = item
      })
      this.setState({ items: items })
    }.bind(this))
  },

  addItem: function (newItemValue, callback) {
    var items = this.state.items
    var newItemData = {
      title: newItemValue
    }
    $.ajax({
      type: 'POST',
      url: this.props.source,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(newItemData),
      success: function (data) {
			  items[data.id] = data
	      this.setState({items: items}, function () {
	        if (typeof callback === 'function') {
	          callback(data)
	        }
	    })
      }.bind(this) })
  },

  removeItem: function (id) {
    console.log('deleting items[' + id + ']')
    var deleteTarget = this.state.items[id]
    console.log('target', deleteTarget)
    if (!deleteTarget) {
      console.log('no target')
      return
    }

    $.ajax({
      type: 'DELETE',
      url: this.props.source + '/' + deleteTarget.id,
      success: function () {
        var items = this.state.items
        delete items[id]
        this.setState({ items: items})
      }.bind(this)
    })
  },

  updateItem: function (newData, callback) {
    console.log('newData', newData)
    $.ajax({
      type: 'PUT',
      url: this.props.source + '/' + newData.id,
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(newData),
      success: function (data) {
        var items = this.state.items
        items[newData.id] = data
        this.setState({ items: items}, function () {
          if (typeof callback === 'function') {
            callback(data)
          }
        })
      }.bind(this)
    })
  },
	clearCompleted: function () {
		var items = this.state.items
		console.log('items', items);

		Object.keys(this.state.items).map(function (id) {
			if (this.state.items[id].done == true) {
				this.removeItem(id)
			}
		}.bind(this))
	},

  render: function () {
		var footer = null
    // render items
    var renderedItems = Object.keys(this.state.items).map(function (id) {
      var item = this.state.items[id]
      return (
        <Item key={id}
          id={item.id}
          value={item.title}
          checked={item.done}
          deleteCallback={this.removeItem}
          updateCallback={this.updateItem}
                />
      )
    }.bind(this))

		if (renderedItems.length > 0) {
			var count = 0
			renderedItems.forEach(function (e) {
				if (!e.props.checked) {
					++count
				}
			})

			footer = <Footer count={count} onClearCompleted={this.clearCompleted}/>
		}

    return (
      <div>
        <header>
          <h1>Todos</h1>
          <ItemNewField saveCallback={this.addItem} />
        </header>
        <div className='list'>
          <ul id="todo-list">{renderedItems}</ul>
        </div>
				{footer}
      </div>
    )
  }
})

var ItemNewField = React.createClass({
  getInitialState: function () {
    return { value: '' }
  },

  onKeyPress: function (evt) {
    if (evt.key === 'Enter') {
      this.save()
    }
  },

  handleChange: function (evt) {
    this.setState({ value: evt.target.value })
  },

  save: function () {
    if (!this.state.value) {
      return
    }
    this.props.saveCallback(this.state.value, function () {
      this.setState(this.getInitialState())
    }.bind(this))
  },

  render: function () {
    return (<div><input
      id='new-todo'
      type='text'
      placeholder='What needs to be done?'
      onChange={this.handleChange}
      onBlur={this.save}
      onKeyPress={this.onKeyPress}
      value={this.state.value}
        /></div>)
  }
})

var ItemField = React.createClass({
  getInitialState: function () {
    return {
      value: this.props.initialValue,
      initialValue: this.props.initialValue,
      editMode: false
    }
  },

  onKeyPress: function (evt) {
    if (evt.key === 'Enter' ) {
      this.save()
    }
  },

  handleClick: function (evt) {
    this.enableEditMode(function () {
      $(ReactDOM.findDOMNode(this.refs.editField)).find('input[type="text"]').focus()
    }.bind(this))
  },

  enableEditMode: function (callback) {
    this.setState({
      editMode: true
    }, function () {
      if (typeof callback === 'function') {
        callback()
      }
    })
  },

  disableEditMode: function () {
    this.setState({ editMode: false })
  },

  handleChange: function (evt) {
    this.setState({ value: evt.target.value })
  },

  showDeleteButton: function () {
    this.setState({ showDeleteButton: true })
  },

  hideDeleteButton: function () {
    this.setState({ showDeleteButton: false })
  },

  save: function () {
    if (this.state.value == this.props.initialValue) {
      this.disableEditMode()
      return
    }
    var newData = {
      id: this.props.id,
      title: this.state.value
    }
    this.props.updateCallback(newData, function () {
      this.disableEditMode()
    }.bind(this))
  },

  render: function () {
    if (!this.state.editMode) {
            // display mode
      return (
        <label
          onClick={this.handleClick}
          onMouseOver={this.showDeleteButton}
          onMouseOut={this.hideDeleteButton}
                >
          {this.state.value}
          <DeleteButton show={this.state.showDeleteButton} id={this.props.id} deleteCallback={this.props.deleteCallback} />
        </label>
      )
    }

        // edit mode
    return (
      <div>
        <input
          type='text'
          ref='editField'
          onChange={this.handleChange}
          onBlur={this.save}
          onKeyPress={this.onKeyPress}
          value={this.state.value}
                />
        <DeleteButton
          show={this.state.showDeleteButton}
          id={this.props.id}
          deleteCallback={this.props.deleteCallback}
                />
      </div>
    )
  }
})

var Item = React.createClass({
  render: function () {
		var done = this.props.checked ? 'done' : ''
    return (
      <li className={done}>
			<div className="view">
        <ItemCheckbox
          id={this.props.id}
          checked={this.props.checked}
          updateCallback={this.props.updateCallback}
                />
        <ItemField
          id={this.props.id}
          initialValue={this.props.value}
          updateCallback={this.props.updateCallback}
          deleteCallback={this.props.deleteCallback}
                />
			</div>
      </li>
    )
  }
})

var ItemCheckbox = React.createClass({
  handleChange: function (evt) {
    var done = !this.props.checked
    this.props.updateCallback({
      id: this.props.id,
      done: done
    })
  },

  render: function () {
    return (
      <input className="toggle" type='checkbox' ref='box' checked={this.props.checked} onChange={this.handleChange} />
    )
  }
})

var DeleteButton = React.createClass({
  handleClick: function () {
    this.props.deleteCallback(this.props.id)
  },
  render: function () {
    return <a className='destroy' onClick={this.handleClick}></a>
  }
})

var Footer = React.createClass({
	render: function () {
		return (
			<div className="todo-count">
				<b>{this.props.count}</b>Items Left
				<a id="clear-completed" onClick={this.props.onClearCompleted}>Clear completed</a>
			</div>
		)
	}
})

ReactDOM.render(
  <List source='/todos' />,
    document.getElementById('todoapp')
)


// var Greeting = React.createClass({
//   render: function () {
//     return (
//       <header>
//         <h1>Todos</h1>
//         <input id='new-todo' type='text' placeholder='What needs to be done?' />
//       </header>
//     )
//   }
// })
//
// ReactDOM.render(
//   <Greeting />,
//   document.getElementById('todoapp')
// )
