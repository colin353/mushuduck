// Generated by CoffeeScript 1.6.2
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
    TradingStage.__super__.constructor.apply(this, arguments);
  }

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
    if (this.product.amount > 0) {
      this.product.amount -= 1;
      pycon.transaction({
        action: 'sell',
        data: {
          productToSell: this.product.name
        }
      }, function(data) {
        player.giveGold(data.pay);
        return this.needsRefresh();
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
