// Generated by CoffeeScript 1.6.2
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

  Card.prototype.on_production = function() {
    return true;
  };

  Card.prototype.on_factory = function() {
    return true;
  };

  Card.prototype.destroy = function() {
    var i, _i, _ref, _results;

    _results = [];
    for (i = _i = 0, _ref = player.cards.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (this === player.cards[i]) {
        player.cards.splice(i, 1);
        if (stage.refreshCards != null) {
          window.stage.refreshCards();
        }
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Card.prototype.on_trade_start = function(items_to_trade) {
    return items_to_trade;
  };

  Card.prototype.on_trade_end = function(items_received) {
    return true;
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
    picture += "&rarr; " + this.gold_reward + window.config.gold;
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

window.QuantumFluctuationCard = (function(_super) {
  __extends(QuantumFluctuationCard, _super);

  function QuantumFluctuationCard() {
    QuantumFluctuationCard.__super__.constructor.apply(this, arguments);
    this.title = "Quantum Fluctuation";
    this.subtitle = "Creates a chance for a random fruit to appear";
    this.price = 50;
    this.amplitude = 0.20;
  }

  QuantumFluctuationCard.prototype.render = function() {
    return "<p>Quantum Fluctuation</p>";
  };

  QuantumFluctuationCard.prototype.on_production = function() {
    var fruit, fruits, index, name, p, _ref;

    if (Math.random() < this.amplitude) {
      fruits = [];
      _ref = player.products;
      for (name in _ref) {
        p = _ref[name];
        fruits.push(name);
      }
      index = Math.floor(Math.random() * fruits.length);
      fruit = fruits[index];
      player.products[fruit].amount += 1;
      return console.log('A quantum fluctuation has occurred! ', fruit);
    }
  };

  return QuantumFluctuationCard;

})(Card);

window.GMCornCard = (function(_super) {
  __extends(GMCornCard, _super);

  function GMCornCard() {
    GMCornCard.__super__.constructor.apply(this, arguments);
    this.title = "Genetically modified corn";
    this.subtitle = "Production of all fruits increases with the amount of corn you have.";
    this.price = 50;
    this.yield_per = 10;
  }

  GMCornCard.prototype.render = function() {
    return "<p>GM Corn</p>";
  };

  GMCornCard.prototype.on_factory = function(factory) {
    if (player.products['corn'].amount > this.yield_per) {
      factory.product.amount += 1;
      return console.log('Experienced boost: thanks to GM Corn!');
    }
  };

  return GMCornCard;

})(Card);

window.TomatoWarCard = (function(_super) {
  __extends(TomatoWarCard, _super);

  function TomatoWarCard() {
    TomatoWarCard.__super__.constructor.apply(this, arguments);
    this.title = "Tomato War";
    this.subtitle = "The person with the most tomatoes wins a lot of money at the end of the round.";
    this.price = 50;
  }

  TomatoWarCard.prototype.render = function() {
    return "<p>Tomato War</p>";
  };

  TomatoWarCard.prototype.activate = function() {
    pycon.transaction({
      action: "tomatoWarCardActivated"
    });
    return this.destroy();
  };

  return TomatoWarCard;

})(Card);

window.CornTheMovieCard = (function(_super) {
  __extends(CornTheMovieCard, _super);

  function CornTheMovieCard() {
    CornTheMovieCard.__super__.constructor.apply(this, arguments);
    this.title = "Corn: The Movie";
    this.subtitle = "All of your trades involving corn will give both players gold.";
    this.price = 20;
    this.primary_reward = 15;
    this.secondary_reward = 5;
    this.max_trades = 10;
    this.give_gold = false;
  }

  CornTheMovieCard.prototype.render = function() {
    return "<p>Corn Movie</p>";
  };

  CornTheMovieCard.prototype.on_trade_end = function(items_received) {
    if (this.give_gold) {
      player.giveGold(this.primary_reward);
    }
    this.max_trades -= 1;
    if (this.max_trades === 0) {
      return this.destroy();
    }
  };

  CornTheMovieCard.prototype.on_trade_start = function(items_to_trade) {
    if ((items_to_trade['corn'] != null) && items_to_trade['corn'] > 0) {
      this.give_gold = true;
      if (items_to_trade['gold'] == null) {
        items_to_trade['gold'] = 0;
      }
      items_to_trade['gold'] += this.secondary_reward;
      console.log('Corn: The Movie royalties paid');
    }
    return items_to_trade;
  };

  return CornTheMovieCard;

})(Card);

window.CornFamine = (function(_super) {
  __extends(CornFamine, _super);

  function CornFamine() {
    CornFamine.__super__.constructor.apply(this, arguments);
    this.title = "Corn Famine";
    this.subtitle = "All corn production will be reduced for one round.";
    this.price = 75;
    this.product = 'corn';
  }

  CornFamine.prototype.render = function() {
    return "<p>A " + this.product + " famine</p>";
  };

  CornFamine.prototype.activate = function() {
    pycon.transaction({
      action: 'famineActivated',
      data: {
        productAffected: this.product
      }
    });
    return this.destroy();
  };

  return CornFamine;

})(Card);

window.BlueberryFamine = (function(_super) {
  __extends(BlueberryFamine, _super);

  function BlueberryFamine() {
    BlueberryFamine.__super__.constructor.apply(this, arguments);
    this.title = "Blueberry Famine";
    this.subtitle = "All blueberry production will be reduced for one round.";
    this.price = 75;
    this.product = 'blueberry';
  }

  return BlueberryFamine;

})(CornFamine);

window.PurpleFamine = (function(_super) {
  __extends(PurpleFamine, _super);

  function PurpleFamine() {
    PurpleFamine.__super__.constructor.apply(this, arguments);
    this.title = "Purple Famine";
    this.subtitle = "All purple production will be reduced for one round.";
    this.price = 75;
    this.product = 'purple';
  }

  return PurpleFamine;

})(CornFamine);

window.TomatoFamine = (function(_super) {
  __extends(TomatoFamine, _super);

  function TomatoFamine() {
    TomatoFamine.__super__.constructor.apply(this, arguments);
    this.title = "Tomato Famine";
    this.subtitle = "All tomato production will be reduced for one round.";
    this.price = 75;
    this.product = 'tomato';
  }

  return TomatoFamine;

})(CornFamine);

window.CornTheMovieCard = (function(_super) {
  __extends(CornTheMovieCard, _super);

  function CornTheMovieCard() {
    CornTheMovieCard.__super__.constructor.apply(this, arguments);
    this.title = "Corn: The Movie";
    this.subtitle = "All of your trades involving corn will give both players gold.";
    this.price = 20;
    this.primary_reward = 15;
    this.secondary_reward = 5;
    this.max_trades = 10;
    this.give_gold = false;
  }

  CornTheMovieCard.prototype.render = function() {
    return "<p>Corn Movie</p>";
  };

  CornTheMovieCard.prototype.on_trade_end = function(items_received) {
    if (this.give_gold) {
      player.giveGold(this.primary_reward);
    }
    this.max_trades -= 1;
    if (this.max_trades === 0) {
      return this.destroy();
    }
  };

  CornTheMovieCard.prototype.on_trade_start = function(items_to_trade) {
    if ((items_to_trade['corn'] != null) && items_to_trade['corn'] > 0) {
      this.give_gold = true;
      if (items_to_trade['gold'] == null) {
        items_to_trade['gold'] = 0;
      }
      items_to_trade['gold'] += this.secondary_reward;
      console.log('Corn: The Movie royalties paid');
    }
    return items_to_trade;
  };

  return CornTheMovieCard;

})(Card);

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

card_deck.push(window.QuantumFluctuationCard);

card_deck.push(window.GMCornCard);

card_deck.push(window.CornTheMovieCard);

card_deck.push(window.TomatoWarCard);

card_deck.push(window.TomatoFamine);

card_deck.push(window.CornFamine);

card_deck.push(window.BlueberryFamine);

card_deck.push(window.PurpleFamine);
