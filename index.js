var trout = (function () {
  function createHandler (model) {
    var handler = {
      actions: {},
      state: model
    }

    handler.action = function (name, handler) {
      if (handler) {
        if (!this.actions[name]) {
          this.actions[name] = handler
        }
      } else {
        if (this.actions[name]) {
          this.state = this.actions[name](this.state)
        }
      }
    }.bind(handler)

    return handler
  }

  return createHandler
})()

window.trout = trout
