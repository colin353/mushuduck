// Generated by CoffeeScript 1.6.2
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
