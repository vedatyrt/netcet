var userInput = null;
var window_focus = true;
var notificationStack = new Array;
var socket = io();

var titleInterval;

var COOKIE_NAME_USERNAME = "ncusername";

var Settings = {
    appName: "netçet",
    title: "NetÇet",
    version: "0.1",
    showNotifications: true,
    newMessageAlert: "New Message",
    notificatioSupported: isNewNotificationSupported()
}

function getUsername(first) {

    //if(first)
    var cusername = getCookie(COOKIE_NAME_USERNAME, null);

    if (cusername == null) {
        while (!userInput) {
            userInput = window.prompt("Enter Your Username ", "");
        }
        setCookie(COOKIE_NAME_USERNAME, userInput, 7);
    } else
        userInput = cusername;
    socket.emit('connected', userInput);
}

function getCookie(cname, defaultValue) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return defaultValue;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

$('.send_message').click(function(e) {
    var messageText = getMessageText();
    if (messageText) {
        var message = {
            "user": userInput,
            msg: messageText,
        };
        socket.emit('chat', message);
        clearMessageText();
    }
    return false;
});

$('.message_input').keyup(function(e) {
    if (e.which === 13) {
        var message = {
            "user": userInput,
            msg: getMessageText(),
        };
        socket.emit('chat', message);
        clearMessageText();
    }
});

// $('form').submit(function() {
//     if ($('#m').val()) {
//         var message = {
//             "user": userInput,
//             msg: $('#m').val(),
//         };
//         socket.emit('chat', message);
//         $('#m').val('');
//     }
//     return false;
// });

socket.on('chat', function(message) {
    var side = "right";
    if (message.user != userInput) {
        side = "left"
        notifyUser(message);
    }

    var mes = new Message({
        text: replaceURLWithHTMLLinks(message.msg),
        message_side: side,
        user: message.user,
        date: message.date
    });

    mes.draw();
    scroll();
});

socket.on('connected', function(username) {
    if (username == userInput)
        return;

    var info = new Message({
        text: username + " connected",
        message_side: "info"
    });

    info.draw();
    scroll();
});

socket.on('disconnected', function(username) {
    if (username == userInput)
        return;

    var info = new Message({
        text: username + " disconnected",
        message_side: "info"
    });

    info.draw();
    scroll();
});

socket.on('error', function(err) {
    //alert(err.message);
});

//source : http://stackoverflow.com/questions/6707476/how-to-find-if-a-text-contains-url-string
function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
}

function scroll() {
    $messages = $('.messages');
    $messages.animate({
        scrollTop: $messages.prop('scrollHeight')
    }, 300);
}

function notifyUser(message) {

    if (!Settings.notificatioSupported) return;

    //if(window_focus) return;
    clearInterval(titleInterval);
    titleInterval = setInterval(function() {
        toggleTitle()
    }, 500);

    if (!Settings.showNotifications) return;

    if (!Notification) {
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification(Settings.appName + ' - ' + message.user, {
            icon: 'https://raw.githubusercontent.com/agtokty/netcet/master/public/images/netcetlogo.PNG',
            body: message.date + " " + message.msg,
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
            clearAllNotifications();
        };
        notificationStack.push(notification);
    }
}

//SOURCE : http://stackoverflow.com/questions/29774836/failed-to-construct-notification-illegal-constructor
function isNewNotificationSupported() {
    if (!detectmob())
        return true;

    if (!window.Notification || !Notification.requestPermission)
        return false;

    Notification.requestPermission();
    var notification = null;
    try {
        notification = new Notification('');
        notification.close();
    } catch (e) {
        if (e.name == 'TypeError')
            return false;
    } finally {
        if (notification && notification.close)
            notification.close();
    }
    return true;
}

function detectmob() {
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    } else {
        return false;
    }
}

function toggleTitle() {
    if (document.title == Settings.title)
        document.title = Settings.newMessageAlert;
    else
        document.title = Settings.title;
}

function clearAllNotifications() {
    if (notificationStack.length > 0) {
        for (var i = 0; i < notificationStack.length; i++)
            notificationStack[i].close();
        notificationStack = new Array();
    }

    clearInterval(titleInterval);
    document.title = Settings.title
}

var getMessageText = function() {
    var $message_input;
    $message_input = $('.message_input');
    return $message_input.val();
};

var clearMessageText = function() {
    var $message_input = $('.message_input');
    return $message_input.val("");
};


var resizeMessages = function() {
    $(".messages").height($(window).height() - ($(".top_menu").height() + $(".bottom_wrapper").height() + 90));
}

$(function() {

    resizeMessages()

    window.onresize = function(event) {
        resizeMessages()
    };

    document.title = Settings.title;

    window.onblur = function() {
        window_focus = false;
    }

    window.onfocus = function() {
        window_focus = true;
        clearAllNotifications();
    }

    window.onbeforeunload = function() {
        socket.emit('disconnected', userInput);
    }

    getUsername();

    if (Notification.permission !== "granted")
        Notification.requestPermission();

    $("#btnSettings").on("click",function(){
        $('#myModal').modal('show'); 
    })

});