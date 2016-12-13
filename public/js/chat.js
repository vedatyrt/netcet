var Message;
Message = function(arg) {
    this.user = arg.user;
    this.date = arg.date;
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

            $message.find('.message_time').html(_this.date);

            var letter = "...";
            if (this.user) {
                letter = this.user.charAt(0).toUpperCase()

                $username_first_letter = $message.find('.username_first_letter');
                $username_first_letter.html(letter);

                $avatar = $message.find('.avatar');
                $avatar.attr("title", this.user);
            }

            $('.messages').append($message);
            return setTimeout(function() {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};