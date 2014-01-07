// Generated by CoffeeScript 1.6.2
var Production,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
    var span;

    this.dom_object.html("");
    if (this.productionfacility.factory) {
      this.dom_object.css('opacity', '1');
      this.dom_object.append($("<span class='buy_factory_message'></span>"));
      span = this.dom_object.children('span');
      span.append($("<span>Level " + this.productionfacility.level + "</span>"));
      span.append($("<p>" + (this.productionfacility.upgradeCost.call(this.productionfacility)) + window.config.gold + "<br /> to upgrade</p>"));
    } else {
      this.dom_object.append("<span class='buy_factory_message'>" + (this.productionfacility.upgradeCost.call(this.productionfacility)) + window.config.gold + "<br /> to start</span>");
      this.dom_object.css('opacity', '0.5');
    }
    return true;
  };

  return Production;

})();
