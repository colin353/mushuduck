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
      this.socket.send(JSON.stringify({
        data: message,
        transaction_id: transaction_id
      }));
      return console.log('Transaction sent: ', message);
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

  $(function() {
    var moving_average_samples;

    console.log('Gryo begin tracking');
    window.acc = {
      x: 0,
      y: 0,
      z: 0
    };
    window.avg_acc = false;
    moving_average_samples = 50;
    window.censor_gyroscope = false;
    return window.ondevicemotion = function(e) {
      var change, i, string, x, y, z, _i, _ref;

      x = e.accelerationIncludingGravity.x;
      y = e.accelerationIncludingGravity.y;
      z = e.accelerationIncludingGravity.z;
      change = Math.abs(acc.x - x) + Math.abs(acc.y - y) + Math.abs(acc.z - z);
      string = '';
      for (i = _i = 1, _ref = Math.round(change); 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        string += 'XXX';
      }
      console.log(string);
      window.acc = {
        x: x,
        y: y,
        z: z
      };
      if (change > 20 && !window.censor_gyroscope) {
        window.censor_gyroscope = true;
        pycon.transaction({
          action: 'bump',
          data: {
            tomato: 5,
            purple: 1
          }
        }, function() {
          return true;
        });
        return setTimeout(function() {
          return window.censor_gyroscope = false;
        }, 500);
      }
    };
  });

  handleResize = function() {
    return $('.statusbar').css('font-size', (0.9 * $('.statusbar').height()) + 'px');
  };

  $(window).bind('resize', handleResize);

  window.updateStatusBar = function() {
    return $('.money').html('$' + player.gold);
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
    pycon.register_for_event('playerCountChanged', function(data) {
      console.log('Player count changed: ', data);
      return $('.playercount').html(data.count);
    });
    return pycon.register_for_event('stageBegin', function(data) {
      if (typeof stage !== "undefined" && stage !== null) {
        window.stage.end();
      }
      if (data.stageType === 'Production') {
        return window.stage = new ProductionStage();
      } else if (data.stageType === 'Trading') {
        return window.stage = new TradingStage();
      } else {
        throw 'illegal :(';
      }
    });
  };

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

  window.Player = (function() {
    function Player() {
      var p, _i, _len, _ref;

      this.gold = 0;
      this.products = [];
      this.productionfacilities = [];
      _ref = ['tomato', 'blueberry', 'purple', 'corn'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        this.products[p] = new Product(p);
        this.productionfacilities[p] = new ProductionFacility(this.products[p]);
      }
      this.products['tomato'].color = 'red';
      this.products['blueberry'].color = 'blue';
      this.products['purple'].color = 'purple';
      this.products['corn'].color = 'orange';
      true;
    }

    Player.prototype.giveGold = function(amount) {
      this.gold += amount;
      return updateStatusBar();
    };

    Player.prototype.doYes = function() {
      return true;
    };

    return Player;

  })();

  window.Product = (function() {
    function Product(name) {
      this.name = name;
      this.amount = 5;
      this.price = 0;
      this.color = "green";
      true;
    }

    Product.prototype.getPrice = function() {
      return this.price = Math.round(Math.random() * 100, 2);
    };

    Product.prototype.generator = function() {
      return player.productionfacilities[this.name];
    };

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

  player.giveGold(5);

  window.ProductionStage = (function() {
    function ProductionStage() {
      var me;

      me = this;
      this.productions = [];
      this.stage_name = '.productionstage-interface';
      $(this.stage_name).show();
      $("" + this.stage_name + " .box").each(function() {
        var type;

        type = $(this).attr('data-production-type');
        return me.productions.push(new Production($(this), me, player.productionfacilities[type]));
      });
      $('.ready').tap(function() {
        return me.ready();
      });
      true;
    }

    ProductionStage.prototype.end = function() {
      $(this.stage_name).hide();
      return $('.ready').unbind();
    };

    ProductionStage.prototype.ready = function() {
      $('.ready').css('background-color', 'green');
      return pycon.transaction({
        'action': 'ready'
      }, function() {
        return true;
      });
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

  window.TradingStage = (function() {
    function TradingStage() {
      var me;

      me = this;
      $('.tradingstage-interface').show();
      this.products = {};
      $('.tradingstage-interface .box').each(function() {
        var type;

        type = $(this).attr('data-production-type');
        return me.products[type] = new TradingProduct($(this), player.products[type]);
      });
      $('.tradingstage-interface .inventory').sortable({
        helper: function(e, ui) {
          var type;

          type = ui.attr('data-production-type');
          if (me.products[type].product.amount <= 0) {
            return $('<div></div>');
          } else {
            return $("<div class='square'></div>").css('background-color', player.products[ui.attr('data-production-type')].color);
          }
        },
        start: function(e, ui) {
          return ui.item.show();
        },
        connectWith: '.trade',
        change: function() {
          return $(this).sortable("refreshPositions");
        },
        placeholder: 'test',
        stop: function(e, ui) {
          var item, offset;

          offset = ui.originalPosition.top - ui.position.top;
          console.log('moved to position: ', offset);
          item = me.products[ui.item.attr('data-production-type')];
          if (offset > 100) {
            item.sell.call(item);
          } else if (offset < -100) {
            item.trade.call(item);
          }
          return $(this).sortable('cancel');
        }
      });
      $('.tradingstage-interface .trading span.tradecount').each(function() {
        var color, type;

        $(this).html("<div class='square'></div> x <span class='count'>0</span>");
        type = $(this).attr('data-production-type');
        color = player.products[type].color;
        $(this).children('.square').css('background-color', color);
        return $(this).hide();
      });
      $('.trading').on('taphold', function() {
        return me.clearTrades();
      });
    }

    TradingStage.prototype.clearTrades = function() {};

    TradingStage.prototype.refreshTradingPlatform = function() {
      var name, p, _ref, _results;

      _ref = this.products;
      _results = [];
      for (name in _ref) {
        p = _ref[name];
        console.log('Refreshing trading platform for ', p.product.name);
        if (p.for_trade > 0) {
          _results.push($(".tradingstage-interface .tradecount[data-production-type='" + name + "']").show().children('.count').html(p.for_trade));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return TradingStage;

  })();

  window.TradingProduct = (function() {
    function TradingProduct(dom_element, product) {
      this.dom_element = dom_element;
      this.product = product;
      this.product.getPrice();
      this.needsRefresh();
      this.for_trade = 0;
      true;
    }

    TradingProduct.prototype.trade = function() {
      if (this.product.amount > 0) {
        this.for_trade += 1;
        this.product.amount -= 1;
        this.needsRefresh();
        stage.refreshTradingPlatform.call(stage);
        return true;
      } else {
        return false;
      }
    };

    TradingProduct.prototype.sell = function() {
      if (this.product.amount > 0) {
        this.product.amount -= 1;
        player.giveGold(this.product.price);
        this.needsRefresh();
        return true;
      } else {
        return false;
      }
    };

    TradingProduct.prototype.needsRefresh = function() {
      this.dom_element.children('.amount').html(this.product.amount);
      return this.dom_element.children('.price').html("$" + this.product.price);
    };

    return TradingProduct;

  })();

}).call(this);
