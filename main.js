// Generated by CoffeeScript 1.6.2
(function() {
  var Production, error,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
        console.log('Received transaction data: ', message.data);
        return this.response_handlers[message.transaction_id].call(this, message.data);
      } else if (message.eventName != null) {
        console.log('Received event message: ', message.eventName);
        console.log('Event data: ', message.data);
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

  window.Stage = (function() {
    function Stage() {
      this.time = 0;
      true;
    }

    Stage.prototype.bump = function() {
      return true;
    };

    Stage.prototype.trade_complete = function() {
      return true;
    };

    Stage.prototype.price_updated = function() {
      return true;
    };

    Stage.prototype.timer_begin = function() {
      return true;
    };

    Stage.prototype.end = function() {
      return true;
    };

    return Stage;

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

    window.acc = {
      x: 0,
      y: 0,
      z: 0
    };
    window.avg_acc = false;
    moving_average_samples = 50;
    window.censor_gyroscope = false;
    return window.ondevicemotion = function(e) {
      var change, x, y, z;

      x = e.accelerationIncludingGravity.x;
      y = e.accelerationIncludingGravity.y;
      z = e.accelerationIncludingGravity.z;
      change = Math.abs(acc.x - x) + Math.abs(acc.y - y) + Math.abs(acc.z - z);
      window.acc = {
        x: x,
        y: y,
        z: z
      };
      if (change > 20 && !window.censor_gyroscope) {
        window.censor_gyroscope = true;
        window.stage.bump.call(window.stage);
        return setTimeout(function() {
          return window.censor_gyroscope = false;
        }, 500);
      }
    };
  });

  window.handleResize = function() {
    $('.statusbar').css('font-size', (0.9 * $('.statusbar').height()) + 'px');
    return $(window).scrollTop(0);
  };

  $(window).bind('resize', window.handleResize);

  $(function() {
    return window.handleResize();
  });

  window.updateStatusBar = function() {
    return $('.money').html('$' + player.gold);
  };

  window.updateCountdown = function() {
    return $('.countdown').html(stage.time);
  };

  window.config = $.ajax({
    type: "GET",
    url: "/configuration.json",
    async: false
  }).responseText;

  try {
    window.config = JSON.parse(window.config);
  } catch (_error) {
    error = _error;
    throw "Configuration loaded from 'configuration.json' is invalid.";
  }

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
    pycon.register_for_event('stageBegin', function(data) {
      if (typeof stage !== "undefined" && stage !== null) {
        window.stage.end();
      }
      if (data.stageType === 'Production') {
        return window.stage = new ProductionStage();
      } else if (data.stageType === 'Trading') {
        return window.stage = new TradingStage();
      } else if (data.stageType === 'Bidding') {
        return window.stage = new BiddingStage();
      } else {
        throw 'illegal :(';
      }
    });
    pycon.register_for_event('TradeCompleted', function(data) {
      if (typeof stage !== "undefined" && stage !== null) {
        return window.stage.trade_complete.call(stage, data);
      } else {
        return console.log('Received illegal trade...?');
      }
    });
    pycon.register_for_event('PriceUpdated', function(data) {
      var name, price, _ref;

      _ref = data.prices;
      for (name in _ref) {
        price = _ref[name];
        if (player.products[name] != null) {
          player.products[name].price = price;
        }
      }
      return window.stage.price_updated.call(stage);
    });
    pycon.register_for_event('TimerBegin', function(data) {
      console.log('Event handled: ', stage);
      return window.stage.timer_begin.call(window.stage, data.duration);
    });
    return updateStatusBar();
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
      this.products['tomato'].color = '#DD514C';
      this.products['blueberry'].color = '#0E90D2';
      this.products['purple'].color = '#8058A5';
      this.products['corn'].color = '#FAD232';
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
      this.amount = 0;
      this.price = 0;
      this.color = "green";
      true;
    }

    Product.prototype.getPrice = function() {
      return this.price;
    };

    Product.prototype.generator = function() {
      return player.productionfacilities[this.name];
    };

    return Product;

  })();

  window.ProductionFacility = (function() {
    function ProductionFacility(product) {
      this.product = product;
      this.capacity = 1;
      this.factory = false;
      this.level = 0;
      true;
    }

    ProductionFacility.prototype.run_factory = function() {
      if (!this.factory) {
        return false;
      }
      this.product.amount += this.capacity;
      return true;
    };

    ProductionFacility.prototype.upgradeCost = function() {
      if (this.factory) {
        return this.level * window.config.upgrade_cost;
      } else {
        return window.config.factory_cost;
      }
    };

    ProductionFacility.prototype.upgrade = function() {
      if (!this.factory) {
        this.factory = true;
        return this.level = 1;
      } else {
        this.capacity = this.capacity + 1;
        return this.level += 1;
      }
    };

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

  player.giveGold(window.config.starting_money);

  window.ProductionStage = (function(_super) {
    __extends(ProductionStage, _super);

    function ProductionStage() {
      var me;

      me = this;
      this.productions = [];
      this.type = 'ProductionStage';
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
      $('.ready').show();
      $('.ready').removeClass('active');
      ProductionStage.__super__.constructor.apply(this, arguments);
    }

    ProductionStage.prototype.end = function() {
      $(this.stage_name).hide();
      $('.ready').unbind();
      $('.ready').hide();
      return ProductionStage.__super__.end.apply(this, arguments);
    };

    ProductionStage.prototype.ready = function() {
      $('.ready').addClass('active');
      return pycon.transaction({
        'action': 'ready'
      }, function() {
        return true;
      });
    };

    return ProductionStage;

  })(Stage);

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
      this.needsRefresh();
      true;
    }

    Production.prototype.invest = function(amount) {
      var cost;

      cost = this.productionfacility.upgradeCost.call(this.productionfacility);
      if (cost <= player.gold) {
        player.giveGold(-cost);
        this.productionfacility.upgrade.call(this.productionfacility);
      }
      this.needsRefresh();
      return true;
    };

    Production.prototype.needsRefresh = function() {
      if (this.productionfacility.factory) {
        this.dom_object.css('opacity', '1');
        this.dom_object.children('span').html("Level " + this.productionfacility.level);
      } else {
        this.dom_object.children('span').html("");
        this.dom_object.css('opacity', '0.5');
      }
      return true;
    };

    return Production;

  })();

  window.TradingStage = (function(_super) {
    __extends(TradingStage, _super);

    function TradingStage() {
      var me;

      me = this;
      this.type = 'TradingStage';
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
      $('.trading').on("taphold", function() {
        return me.clearTrades.call(me);
      });
      $('.countdown').show();
      TradingStage.__super__.constructor.apply(this, arguments);
    }

    TradingStage.prototype.end = function() {
      $('.countdown').hide();
      $('.tradingstage-interface').hide();
      return TradingStage.__super__.end.apply(this, arguments);
    };

    TradingStage.prototype.bump = function() {
      var items, name, p, _ref;

      items = {};
      _ref = this.products;
      for (name in _ref) {
        p = _ref[name];
        if (p.for_trade > 0) {
          items[name] = p.for_trade;
        }
      }
      return pycon.transaction({
        action: 'bump',
        data: {
          items: items
        }
      }, function() {
        return true;
      });
    };

    TradingStage.prototype.clearTrades = function() {
      var name, p, _ref;

      _ref = this.products;
      for (name in _ref) {
        p = _ref[name];
        if (p.for_trade > 0) {
          p.product.amount += p.for_trade;
          p.for_trade = 0;
          p.needsRefresh.call(p);
        }
      }
      return this.refreshTradingPlatform();
    };

    TradingStage.prototype.trade_complete = function(data) {
      var amount, name, p, _ref, _ref1;

      _ref = this.products;
      for (name in _ref) {
        p = _ref[name];
        p.for_trade = 0;
      }
      _ref1 = data.items;
      for (name in _ref1) {
        amount = _ref1[name];
        if (this.products[name] != null) {
          this.products[name].for_trade = amount;
          this.products[name].needsRefresh.call(this.products[name]);
        }
      }
      return this.refreshTradingPlatform();
    };

    TradingStage.prototype.price_updated = function() {
      var name, p, _ref, _results;

      _ref = this.products;
      _results = [];
      for (name in _ref) {
        p = _ref[name];
        _results.push(p.needsRefresh.call(p));
      }
      return _results;
    };

    TradingStage.prototype.refreshTradingPlatform = function() {
      var name, p, _ref, _results;

      _ref = this.products;
      _results = [];
      for (name in _ref) {
        p = _ref[name];
        if (p.for_trade > 0) {
          _results.push($(".tradingstage-interface .tradecount[data-production-type='" + name + "']").show().children('.count').html(p.for_trade));
        } else {
          _results.push($(".tradingstage-interface .tradecount[data-production-type='" + name + "']").hide());
        }
      }
      return _results;
    };

    TradingStage.prototype.yield_production = function() {
      var facility, name, p, _ref, _results;

      _ref = this.products;
      _results = [];
      for (name in _ref) {
        p = _ref[name];
        facility = player.productionfacilities[name];
        facility.run_factory.call(facility);
        _results.push(p.needsRefresh.call(p));
      }
      return _results;
    };

    TradingStage.prototype.timer_begin = function(countdown) {
      var count_down, do_production, me;

      me = this;
      this.time = countdown;
      count_down = function() {
        if (stage.type !== 'TradingStage') {
          return;
        }
        stage.time -= 1;
        if (stage.time > 0) {
          setTimeout(count_down, 1000);
        }
        return updateCountdown();
      };
      do_production = function() {
        if (stage.type !== 'TradingStage') {
          return;
        }
        me.yield_production.call(me);
        return setTimeout(do_production, window.config.production_period * 1000);
      };
      setTimeout(count_down, 1000);
      setTimeout(do_production, 500);
      return updateCountdown();
    };

    return TradingStage;

  })(Stage);

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
      var me;

      if (window.stage.type !== 'TradingStage') {
        return;
      }
      if (this.product.amount > 0) {
        this.product.amount -= 1;
        me = this;
        pycon.transaction({
          action: 'sell',
          data: {
            productToSell: this.product.name
          }
        }, function(data) {
          player.giveGold(data.pay);
          return me.needsRefresh.call(me);
        });
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

  window.BiddingStage = (function(_super) {
    __extends(BiddingStage, _super);

    function BiddingStage() {
      var me;

      me = this;
      this.type = "BiddingStage";
      this.stage_name = ".biddingstage-interface";
      $(this.stage_name).show();
      $('.losing').hide();
      $('.winning').hide();
      $('.bid').tap(function() {
        return pycon.transaction({
          action: 'bid',
          data: {
            bidIndex: 0,
            bidAmount: 10
          }
        }, function() {
          return true;
        });
      });
      true;
    }

    BiddingStage.prototype.winning = function() {
      $('.winning').show();
      return $('.losing').hide();
    };

    BiddingStage.prototype.losing = function() {
      $('.winning').hide();
      return $('.losing').show();
    };

    BiddingStage.prototype.newBidAnnouncement = function(data) {};

    return BiddingStage;

  })(Stage);

}).call(this);
