// Generated by CoffeeScript 1.6.2
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
