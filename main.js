// Generated by CoffeeScript 1.6.2
(function() {
  var Production, handleResize;

  this.PyAPI = (function() {
    function PyAPI(socket) {
      var me;

      this.socket = socket != null ? socket : null;
      if (this.socket == null) {
        this.socket = window.socket;
      }
      this.response_handlers = [];
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
      } else {
        return console.log('Received invalid message: ', message);
      }
    };

    PyAPI.prototype.generate_transaction_id = function(message) {
      return "T" + Math.random();
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

  window.jevents = [];

  window.jevent = function(eventName, eventAction) {
    var f, _i, _len, _ref, _results;

    if (eventAction == null) {
      eventAction = null;
    }
    if (eventAction === null) {
      if (window.jevents[eventName] != null) {
        _ref = window.jevents[eventName];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          _results.push(f.call);
        }
        return _results;
      }
    } else {
      if (window.jevents[eventName] != null) {
        return window.jevents[eventName].push(eventAction);
      } else {
        return window.jevents[eventName] = [eventAction];
      }
    }
  };

  window.config = [];

  window.config.websocket_url = "ws://192.168.0.106:8888/json";

  window.config.server_version = 0;

  $(function() {
    window.socket = new WebSocket(window.config.websocket_url);
    window.jevent('SocketOpened', function() {});
    console.log('The socket was opened.');
    socket.onopen = function() {
      console.log("Socket connection opened successfully.");
      window.pycon = new PyAPI(window.socket);
      return window.go();
    };
    return socket.onclose = function() {
      console.log("Socket connection was closed, unexpectedly.");
      return alert("I don't know why, but the socket was closed (!)");
    };
  });

  window.go = function() {
    return window.productionstage = new ProductionStage();
  };

  window.ProductionStage = (function() {
    function ProductionStage() {
      var me;

      me = this;
      this.productions = [];
      $('.box').each(function() {
        var type;

        type = $(this).attr('data-production-type');
        return me.productions.push(new Production($(this), me, player.productionfacilities[type]));
      });
      $('.ready').tap(function() {
        return me.ready();
      });
      true;
    }

    ProductionStage.prototype.ready = function() {
      return $('.ready').css('background-color', 'green');
    };

    return ProductionStage;

  })();

  Production = (function() {
    function Production(dom_object, productionstage, productionfacility) {
      var me;

      this.dom_object = dom_object;
      this.productionstage = productionstage;
      this.productionfacility = productionfacility;
      me = this;
      this.dom_object.tap(function() {
        return me.invest.call(me, 1);
      });
      true;
    }

    Production.prototype.invest = function(amount) {
      this.productionfacility.capacity += amount;
      this.needsRefresh();
      return true;
    };

    Production.prototype.needsRefresh = function() {
      this.dom_object.children('span').html(this.productionfacility.capacity);
      return true;
    };

    return Production;

  })();

  window.Message = (function() {
    function Message() {
      this.dom_selector = '.message';
      this.timeout = 5;
    }

    Message.prototype.display = function(text) {
      var me;

      me = this;
      $(this.dom_selector).children('span').html(text);
      $(this.dom_selector).fadeIn('slow');
      return setTimeout(function() {
        return me.hide.call(me);
      }, this.timeout * 1000);
    };

    Message.prototype.hide = function() {
      return $(this.dom_selector).fadeOut('slow');
    };

    return Message;

  })();

  window.message = new Message();

  handleResize = function() {
    return $('.statusbar').css('font-size', (0.9 * $('.statusbar').height()) + 'px');
  };

  $(window).bind('resize', handleResize);

  handleResize();

  window.Player = (function() {
    function Player() {
      var p, _i, _len, _ref;

      this.gold = 10;
      this.products = [];
      this.productionfacilities = [];
      _ref = ['tomato', 'blueberry', 'purple', 'corn'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        this.products[p] = new Product(p);
        this.productionfacilities[p] = new ProductionFacility(this.products[p]);
      }
      true;
    }

    Player.prototype.doYes = function() {
      return true;
    };

    return Player;

  })();

  window.Product = (function() {
    function Product(name) {
      this.name = name;
      true;
    }

    return Product;

  })();

  window.ProductionFacility = (function() {
    function ProductionFacility(product) {
      this.capacity = 0;
      true;
    }

    ProductionFacility.prototype.generateProduct = function() {
      if (this.capacity * Math.random() > 1) {
        return true;
      } else {
        return false;
      }
    };

    return ProductionFacility;

  })();

  window.player = new Player();

  player.gold = 5;

}).call(this);
