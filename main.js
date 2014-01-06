// Generated by CoffeeScript 1.6.2
(function() {
  var BattleStage, Production, error,
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

      if (responder == null) {
        responder = null;
      }
      transaction_id = this.generate_transaction_id(message);
      if (responder != null) {
        this.response_handlers[transaction_id] = function(response) {
          return responder.call(this, response);
        };
      }
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

    Stage.prototype.new_bid = function() {
      return true;
    };

    Stage.prototype.products_updated = function() {
      return true;
    };

    return Stage;

  })();

  BattleStage = (function(_super) {
    __extends(BattleStage, _super);

    function BattleStage() {
      BattleStage.__super__.constructor.apply(this, arguments);
      true;
    }

    BattleStage.prototype.end = function() {
      message.hide.call(message);
      return player.products['tomato'].amount = 0;
    };

    return BattleStage;

  })(Stage);

  window.BiddingStage = (function(_super) {
    __extends(BiddingStage, _super);

    function BiddingStage() {
      var me;

      me = this;
      this.type = "BiddingStage";
      this.interval = null;
      this.stage_name = ".biddingstage-interface";
      this.current_bid = 10;
      this.card_index = 0;
      $(this.stage_name).show();
      $('.losing').hide();
      $('.winning').hide();
      $('.countdown').show();
      $('.bid').show();
      $('.bid').tap(function() {
        if (player.gold >= me.current_bid) {
          return pycon.transaction({
            action: 'bid',
            data: {
              bidIndex: me.card_index,
              bidAmount: me.get_current_bid.call(me)
            }
          }, function() {
            return true;
          });
        }
      });
      true;
    }

    BiddingStage.prototype.get_current_bid = function() {
      return this.current_bid;
    };

    BiddingStage.prototype.end = function() {
      $(this.stage_name).hide();
      $('.losing').hide();
      $('.winning').hide();
      $('.countdown').hide();
      $('.bid').unbind();
      return clearInterval(this.interval);
    };

    BiddingStage.prototype.winning = function() {
      $('.winning').show();
      $('.losing').hide();
      return $('.bid').hide();
    };

    BiddingStage.prototype.losing = function() {
      $('.winning').hide();
      $('.losing').show();
      return $('.bid').show();
    };

    BiddingStage.prototype.updateBidButton = function() {
      return $('.bid').children('p').html("Bid $" + this.current_bid);
    };

    BiddingStage.prototype.new_card = function(index) {
      console.log('Got a new card', this.card);
      this.card = new card_deck[index]();
      $('.card').children('.title').html(this.card.title);
      $('.card').children('.subtitle').html(this.card.subtitle);
      $('.losing').hide();
      $('.winning').hide();
      $('.bid').show();
      this.card_index = index;
      this.current_bid = this.card.price;
      return this.updateBidButton();
    };

    BiddingStage.prototype.new_bid = function(data) {
      if (data.winning) {
        return this.winning();
      } else {
        this.losing();
        this.current_bid = data.winningBidAmount + window.config.minimum_bid;
        return this.updateBidButton();
      }
    };

    BiddingStage.prototype.timer_begin = function(duration) {
      var count_down, me;

      me = this;
      console.log('Starting to count down: ', duration);
      clearInterval(this.interval);
      this.time = duration;
      count_down = function() {
        if (stage.type !== "BiddingStage") {
          return;
        }
        stage.time -= 1;
        if (stage.time <= 0) {
          clearInterval(me.interval);
        }
        return updateCountdown();
      };
      this.interval = setInterval(count_down, 1000);
      return updateCountdown();
    };

    return BiddingStage;

  })(Stage);

  window.Card = (function() {
    function Card() {
      true;
    }

    Card.prototype.activate = function() {
      return true;
    };

    Card.prototype.get_pay_bonus = function() {
      return 1.0;
    };

    Card.prototype.render = function() {
      return "Invalid card!";
    };

    return Card;

  })();

  window.P_CB_ConversionCard = (function(_super) {
    __extends(P_CB_ConversionCard, _super);

    function P_CB_ConversionCard() {
      this.title = "Purple Pie";
      this.subtitle = "Convert three purple to a corn and a blueberry";
      this.price = 20;
      this.items_from = {
        purple: 3
      };
      this.items_to = {
        corn: 1,
        blueberry: 1
      };
    }

    P_CB_ConversionCard.prototype.render = function() {
      var i, name, number, picture, _i, _j, _ref, _ref1;

      picture = "";
      _ref = this.items_from;
      for (name in _ref) {
        number = _ref[name];
        for (i = _i = 1; 1 <= number ? _i <= number : _i >= number; i = 1 <= number ? ++_i : --_i) {
          picture += "<span style='color:" + player.products[name].color + "'>&#9632;</span>";
        }
      }
      picture += "&rarr;";
      _ref1 = this.items_to;
      for (name in _ref1) {
        number = _ref1[name];
        for (i = _j = 1; 1 <= number ? _j <= number : _j >= number; i = 1 <= number ? ++_j : --_j) {
          picture += "<span style='color:" + player.products[name].color + "'>&#9632;</span>";
        }
      }
      return picture;
    };

    P_CB_ConversionCard.prototype.activate = function() {
      var has_enough, name, number, _ref, _ref1, _ref2;

      has_enough = true;
      _ref = this.items_from;
      for (name in _ref) {
        number = _ref[name];
        if (player.products[name].amount < number) {
          has_enough = false;
        }
      }
      if (has_enough) {
        _ref1 = this.items_from;
        for (name in _ref1) {
          number = _ref1[name];
          player.products[name].amount -= number;
        }
        _ref2 = this.items_to;
        for (name in _ref2) {
          number = _ref2[name];
          player.products[name].amount += number;
        }
        window.stage.products_updated.call(stage);
        return true;
      } else {
        return false;
      }
    };

    return P_CB_ConversionCard;

  })(Card);

  window.BlueberryPieCard = (function(_super) {
    __extends(BlueberryPieCard, _super);

    function BlueberryPieCard() {
      this.title = "Blueberry Pie";
      this.subtitle = "Convert blueberry + corn into 25 gold";
      this.price = 50;
      this.items_from = ['corn', 'blueberry'];
      this.gold_reward = 25;
    }

    BlueberryPieCard.prototype.render = function() {
      var name, picture, _i, _len, _ref;

      picture = "";
      _ref = this.items_from;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        picture += "<span style='color:" + player.products[name].color + "'>&#9632;</span>";
      }
      picture += "&rarr; $" + this.gold_reward;
      return picture;
    };

    BlueberryPieCard.prototype.activate = function() {
      var has_enough, name, _i, _j, _len, _len1, _ref, _ref1;

      has_enough = true;
      _ref = this.items_from;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (player.products[name].amount === 0) {
          has_enough = false;
        }
      }
      if (has_enough) {
        _ref1 = this.items_from;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          name = _ref1[_j];
          player.products[name].amount -= 1;
        }
        player.giveGold(this.gold_reward);
      }
      return window.stage.products_updated.call(stage);
    };

    return BlueberryPieCard;

  })(Card);

  window.PizzaCard = (function(_super) {
    __extends(PizzaCard, _super);

    function PizzaCard() {
      this.title = "Pizza";
      this.subtitle = "Convert tomato + corn into 25 gold";
      this.price = 50;
      this.items_from = ['corn', 'tomato'];
      this.gold_reward = 25;
    }

    return PizzaCard;

  })(BlueberryPieCard);

  window.CornocopiaCard = (function(_super) {
    __extends(CornocopiaCard, _super);

    function CornocopiaCard() {
      this.title = "Cornucopia";
      this.subtitle = "Covert one of all four types into 100 gold";
      this.price = 100;
      this.items_from = ['corn', 'tomato', 'blueberry', 'purple'];
      this.gold_reward = 200;
    }

    return CornocopiaCard;

  })(BlueberryPieCard);

  window.BlueberryJamCard = (function(_super) {
    __extends(BlueberryJamCard, _super);

    function BlueberryJamCard() {
      this.title = "Blueberry Jam";
      this.subtitle = "You can sell blueberries for 25% more gold";
      this.price = 50;
      this.price_modifier = {
        blueberry: 1.25
      };
    }

    BlueberryJamCard.prototype.get_pay_bonus = function(type) {
      if (this.price_modifier[type] != null) {
        return this.price_modifier[type];
      }
    };

    BlueberryJamCard.prototype.render = function() {
      return "<p>Blueberry Jam</p>";
    };

    return BlueberryJamCard;

  })(Card);

  window.BlueberryIceCream = (function(_super) {
    __extends(BlueberryIceCream, _super);

    function BlueberryIceCream() {
      this.title = "Blueberry Icecream";
      this.subtitle = "You can sell blueberries for 50% more gold";
      this.price = 100;
      this.price_modifier = {
        blueberry: 1.5
      };
    }

    BlueberryIceCream.prototype.render = function() {
      return "<p>Blueberry Icecream</p>";
    };

    return BlueberryIceCream;

  })(BlueberryJamCard);

  window.P_BT_ConversionCard = (function(_super) {
    __extends(P_BT_ConversionCard, _super);

    function P_BT_ConversionCard() {
      P_BT_ConversionCard.__super__.constructor.apply(this, arguments);
      this.title = "Eggplant";
      this.subtitle = "Convert three purple to a tomato and a blueberry";
      this.price = 20;
      this.items_from = {
        purple: 3
      };
      this.items_to = {
        blueberry: 1,
        tomato: 1
      };
    }

    return P_BT_ConversionCard;

  })(P_CB_ConversionCard);

  window.P_T_ConversionCard = (function(_super) {
    __extends(P_T_ConversionCard, _super);

    function P_T_ConversionCard() {
      P_T_ConversionCard.__super__.constructor.apply(this, arguments);
      this.title = "Pomato";
      this.subtitle = "Convert two purple to a tomato";
      this.price = 20;
      this.items_from = {
        purple: 2
      };
      this.items_to = {
        tomato: 1
      };
    }

    return P_T_ConversionCard;

  })(P_CB_ConversionCard);

  window.P_B_ConversionCard = (function(_super) {
    __extends(P_B_ConversionCard, _super);

    function P_B_ConversionCard() {
      P_B_ConversionCard.__super__.constructor.apply(this, arguments);
      this.title = "Purpleberry";
      this.subtitle = "Convert two purple to a blueberry";
      this.price = 20;
      this.items_from = {
        purple: 2
      };
      this.items_to = {
        blueberry: 1
      };
    }

    return P_B_ConversionCard;

  })(P_CB_ConversionCard);

  window.card_deck = [];

  card_deck.push(window.BlueberryPieCard);

  card_deck.push(window.BlueberryJamCard);

  card_deck.push(window.CornocopiaCard);

  card_deck.push(window.PizzaCard);

  card_deck.push(window.P_CB_ConversionCard);

  card_deck.push(window.P_B_ConversionCard);

  card_deck.push(window.P_T_ConversionCard);

  card_deck.push(window.P_BT_ConversionCard);

  card_deck.push(window.BlueberryIceCream);

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
      } else if (data.stageType === 'Battle') {
        return window.stage = new BattleStage();
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
    pycon.register_for_event('DisplayMessage', function(data) {
      return message.display.call(message, data.title, data.text);
    });
    pycon.register_for_event('InventoryCountRequested', function(data) {
      return pycon.transaction({
        action: data.callback,
        data: player.getInventoryCount.call(player)
      });
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
    pycon.register_for_event('NewBid', function(data) {
      return window.stage.new_bid.call(window.stage, data);
    });
    pycon.register_for_event('YouWon', function(data) {
      message.display('Nice work!', 'You won the auction!');
      player.giveGold.call(player, -data.winningBidAmount);
      return player.giveCard(data.winningBidIndex);
    });
    pycon.register_for_event('NewCard', function(data) {
      if (window.stage.type === 'BiddingStage') {
        return stage.new_card.call(stage, data.index);
      }
    });
    return updateStatusBar();
  };

  window.Message = (function() {
    function Message() {
      this.dom_selector = '.message';
      this.timeout = 5;
    }

    Message.prototype.display = function(title, text) {
      var me;

      me = this;
      $('.overlay').show();
      $(this.dom_selector).children('.title').html(title);
      $(this.dom_selector).children('.text').html(text);
      $(this.dom_selector).show();
      return $(this.dom_selector).tap(function() {
        return me.hide.call(me);
      });
    };

    Message.prototype.hide = function() {
      $(this.dom_selector).hide();
      return $('.overlay').hide();
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
      this.cards = [];
      true;
    }

    Player.prototype.getInventoryCount = function() {
      var inventory, name, p, _ref;

      inventory = {};
      _ref = this.products;
      for (name in _ref) {
        p = _ref[name];
        inventory[name] = p.amount;
      }
      return inventory;
    };

    Player.prototype.giveGold = function(amount) {
      this.gold += amount;
      return updateStatusBar();
    };

    Player.prototype.doYes = function() {
      return true;
    };

    Player.prototype.giveCard = function(card_index) {
      if (this.cards.length > 2) {
        this.cards.pop();
      }
      return this.cards.push(new window.card_deck[card_index]());
    };

    return Player;

  })();

  window.Product = (function() {
    function Product(name) {
      this.name = name;
      this.amount = 1;
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
      var p, _i, _len, _ref;

      $(this.stage_name).hide();
      $('.ready').unbind();
      $('.ready').hide();
      _ref = this.productions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        p.unbind.call(p);
      }
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

    Production.prototype.unbind = function() {
      return this.dom_object.unbind();
    };

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
      this.dom_object.html("");
      if (this.productionfacility.factory) {
        this.dom_object.css('opacity', '1');
        this.dom_object.append($("<span>Level " + this.productionfacility.level + "</span>"));
        this.dom_object.append($("<p>$" + (this.productionfacility.upgradeCost.call(this.productionfacility)) + " to upgrade</p>"));
      } else {
        this.dom_object.append("<span class='buy_factory_message'>$" + (this.productionfacility.upgradeCost.call(this.productionfacility)) + " to <br /> start</span>");
        this.dom_object.css('opacity', '0.5');
      }
      return true;
    };

    return Production;

  })();

  window.TradingStage = (function(_super) {
    __extends(TradingStage, _super);

    function TradingStage() {
      var card, deck, element, index, me, _i, _len, _ref;

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
      deck = $('.powerups .deck');
      deck.html("");
      index = 0;
      _ref = player.cards;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        card = _ref[_i];
        console.log('Adding card: ', card);
        element = $("<div class='card' data-card-index='" + index + "'>" + (card.render.call(card)) + "</div>").tap(function() {
          card = player.cards[$(this).attr('data-card-index')];
          return card.activate.call(card);
        });
        element.appendTo(deck);
        index += 1;
      }
      $('.tradingstage-interface .trading span.tradecount').each(function() {
        var color, type;

        $(this).html("<span class='block'>&#9632;</span> x <span class='count'>0</span>");
        type = $(this).attr('data-production-type');
        color = player.products[type].color;
        $(this).children('.block').css('color', color);
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
      $('.trading').unbind();
      $('.card').unbind();
      $('.tradingstage-interface .inventory').sortable('destroy');
      this.clearTrades();
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

    TradingStage.prototype.products_updated = function() {
      return this.price_updated();
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
          var card, card_bonus, _i, _len, _ref;

          card_bonus = 1;
          _ref = player.cards;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            card = _ref[_i];
            card_bonus *= card.get_pay_bonus.call(card, me.product.name);
          }
          player.giveGold(Math.round(data.pay * card_bonus, 0));
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

}).call(this);
