(function($) {

    $.fn.initChat = function() {
        var chartInput = this;
        var chatText = $("#chatText");
        var hidden = true;
        var messageHistory = [];
        var messagePointer = -1;

        var closechat = function() {
            hidden = true;
            chartInput.css("opacity", "0");
            messagePointer = messageHistory.length;
            chartInput.val('');
            chatText.text('')
        }

        var updateDimensions = function() {
            chatText.text(chartInput.val());
            var width = chatText.width() + 30;
            chartInput.css({
                width: width,
                marginLeft: (width / 2) * -1
            });
        };

        chartInput.blur(function(e) {
            if (is_panel_showing) return;

            setTimeout(function() { chartInput.focus() }, 0.1);
        });

        chartInput.keydown(function(e) {
            if (is_panel_showing) return;

            if (chartInput.val().length > 0) {
                //set timeout because event occurs before text is entered
                setTimeout(updateDimensions, 0.1);
                chartInput.css("opacity", "1");
            } else {
                closechat();
            }

            if (!hidden) {

                e.stopPropagation();
                if (messageHistory.length > 0) {
                    if (e.keyCode == keys.up) {
                        if (messagePointer > 0) {
                            messagePointer--;
                            chartInput.val(messageHistory[messagePointer]);
                        }
                    } else if (e.keyCode == keys.down) {
                        if (messagePointer < messageHistory.length - 1) {
                            messagePointer++;
                            chartInput.val(messageHistory[messagePointer]);
                        } else {
                            closechat();
                            return;
                        }
                    }
                }
            }
        });

        chartInput.keyup(function(e) {
            if (is_panel_showing) return;

            var k = e.keyCode;
            if (chartInput.val().length >= 45) {
                chartInput.val(chartInput.val().substr(0, 45));
            }

            if (chartInput.val().length > 0) {
                updateDimensions();
                chartInput.css("opacity", "1");
                hidden = false;
            } else {
                closechat();
            }
            if (!hidden) {
                if (k == keys.esc || k == keys.enter || (k == keys.space && chartInput.val().length > 35)) {
                    if (k != keys.esc && chartInput.val().length > 0) {
                        messageHistory.push(chartInput.val());
                        messagePointer = messageHistory.length;
                        app.sendMessage(chartInput.val());
                    }
                    closechat();
                }

                e.stopPropagation();
            }
        });

        chartInput.focus();
    }

    $(function() {
        // $('#chat').initChat();
    });
})(jQuery);