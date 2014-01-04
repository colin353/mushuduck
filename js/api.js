// Generated by CoffeeScript 1.6.2
this.PyAPI = (function() {
  function PyAPI(socket) {
    var me;

    this.socket = socket != null ? socket : null;
    if (this.socket == null) {
      this.socket = window.socket;
    }
    this.response_handlers = [];
    this.event_responders = [];
    me = this;
    this.socket.onmessage = function(message) {
      return me.onmessage.call(me, message);
    };
    this.transaction({
      action: 'validate_version'
    }, function(response) {
      console.log("Attempted version validation. Received response:");
      console.log(response);
      if (response.version !== window.config.server_version) {
        throw "VERSION_ERROR: Invalid reported server version " + response.version + ". Expecting " + window.config.server_version;
      }
    });
  }

  PyAPI.prototype.onmessage = function(message) {
    message = JSON.parse(message.data);
    if ((message.transaction_id != null) && (this.response_handlers[message.transaction_id] != null)) {
      return this.response_handlers[message.transaction_id].call(this, message.data);
    } else if (message.eventName != null) {
      console.log('Received event message: ', message.eventName);
      return this.trigger_event(message.eventName, message.data);
    } else {
      return console.log('Received invalid message: ', message);
    }
  };

  PyAPI.prototype.generate_transaction_id = function(message) {
    return "T" + Math.random();
  };

  PyAPI.prototype.register_for_event = function(eventName, response) {
    if (this.event_responders[eventName] == null) {
      this.event_responders[eventName] = [];
    }
    return this.event_responders[eventName].push(response);
  };

  PyAPI.prototype.trigger_event = function(eventName, data) {
    var e, _i, _len, _ref, _results;

    if (this.event_responders[eventName] != null) {
      _ref = this.event_responders[eventName];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        _results.push(e.call(window, data));
      }
      return _results;
    }
  };

  PyAPI.prototype.transaction = function(message, responder) {
    var transaction_id;

    transaction_id = this.generate_transaction_id(message);
    this.response_handlers[transaction_id] = function(response) {
      return responder.call(this, response);
    };
    return this.socket.send(JSON.stringify({
      data: message,
      transaction_id: transaction_id
    }));
  };

  return PyAPI;

})();
