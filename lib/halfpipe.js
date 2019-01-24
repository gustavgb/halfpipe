if (!module) {
  var module = {}
}
if (!window) {
  var window = {}
}

module.exports = window.halfpipe = (function () {
  function uuid () {
    var dt = new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
  }

  function collect (callback) {
    if (typeof callback !== 'function') {
      throw new Error('"callback" must be a function.')
    }

    var c = {}

    c.containers = []
    c.id = uuid()
    c.callback = callback
    c.subscribers = []

    c.notify = function notify () {
      c.callback()
      c.subscribers.forEach(subscriber => subscriber.callback())
    }

    c.add = function add (id, something) {
      if (!something) {
        something = id
      }
      id = typeof id === 'string' ? id : uuid()

      c.containers.push({
        id,
        item: something
      })

      something.subscribe(c.id, c.notify)
    }

    c.subscribe = function subscribe (callback) {
      if (typeof callback === 'function') {
        var id = uuid()
        c.subscribers.push({
          id,
          callback
        })

        return id
      } else {
        throw new Error('"callback" must be a function.')
      }
    }

    c.unsubscribe = function unsubscribe (id) {
      c.subscribers = c.subscribers.filter(subscriber => subscriber.id !== id)
    }

    return c
  }

  function container (reducer) {
    var c = {}

    c.id = uuid()
    c.state = reducer(null, ['@@halfpipe/init'])
    c.subscribers = []

    if (c.state === undefined) {
      throw new Error('Reducer returned undefined during initialization.')
    }

    c.getState = function getState () {
      return c.state
    }

    c.action = function action (action, payload) {
      c.state = reducer(c.state, [action, payload])

      c.subscribers.forEach(subscriber => subscriber.callback(c.state))
    }

    c.subscribe = function subscribe (id, callback) {
      if (!callback) {
        callback = id
      }

      if (typeof callback === 'function') {
        id = typeof id === 'string' ? id : uuid()
        c.subscribers.push({
          id,
          callback
        })

        return id
      } else {
        throw new Error('"callback" must be a function.')
      }
    }

    c.unsubscribe = function unsubscribe (id) {
      c.subscribers = c.subscribers.filter(subscriber => subscriber.id !== id)
    }

    return c
  }

  return {
    container,
    collect
  }
})()
