var Message;
Message = function(arg) {
    this.user = arg.user;
    this.text = arg.text;
    this.message_side = arg.message_side;
    this.draw = function(_this) {
        return function() {
            var $message;
            if (this.message_side == "info")
                $message = $($('.info_message_template').clone().html());
            else
                $message = $($('.message_template').clone().html());
            $message.addClass(_this.message_side).find('.text').html(_this.text);
            $('.messages').append($message);
            return setTimeout(function() {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};

$(function() {

    $(".messages").height($(window).height() - ($(".top_menu").height() + $(".bottom_wrapper").height() + 90));

    // var getMessageText = function() {
    //     var $message_input;
    //     $message_input = $('.message_input');
    //     return $message_input.val();
    // };

    // var clearMessageText = function() {
    //     var $message_input = $('.message_input');
    //     return $message_input.val("");
    // };

    /*
        var sendMessage = function(text, side, username, date) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = side;
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };

        $('.send_message').click(function(e) {
            return sendMessage(getMessageText());
        });

        $('.message_input').keyup(function(e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });
    */

    //TEST
    // sendMessage('Hello Philip! :)', "left");
    // setTimeout(function() {
    //     return sendMessage('Hi Sandy! How are you?', "left");
    // }, 100);
    // return setTimeout(function() {
    //     return sendMessage('I\'m fine, thank you!', "right");
    // }, 200);

});