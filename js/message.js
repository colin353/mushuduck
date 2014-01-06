// Generated by CoffeeScript 1.6.2
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
