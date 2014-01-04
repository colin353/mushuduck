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
    ProductionStage.__super__.constructor.apply(this, arguments);
  }

  ProductionStage.prototype.end = function() {
    $(this.stage_name).hide();
    $('.ready').unbind();
    $('.ready').hide();
    return ProductionStage.__super__.end.apply(this, arguments);
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
