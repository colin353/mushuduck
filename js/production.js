// Generated by CoffeeScript 1.6.2
var Production;

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
