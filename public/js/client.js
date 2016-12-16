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

function sayWelcome() {
    var welcomeMessage = new Message({
        text: "Welcome " + userInput,
        message_side: "info",
        user: userInput,
        date: getDate()
    });
    welcomeMessage.draw();
}

function getDate() {
    var d = new Date();
    var h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    var m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    var s = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
    return h + ":" + m + ":" + s;
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
    if(!exdays)
		exdays = 7;
	var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function deleteCookie(cname){
	 document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function clearMessages(){
	$(".messages").empty();
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
	
	var user = SingleUser({
		username : username,
		logindate : getDate(),
	});
	user.addOnlineUserTable();
	
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
	
	var user = SingleUser({username : username});
	user.removeFromUserTable();
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

function getOnlineUsers(){
	var url = "http://192.168.1.98:882/api/users";
	$.ajax({
		url: url,
		dataType: 'json',
		success: function( data ) {
			if(data && data.length > 0){
				$("#onlineUserListTableBody").empty();
				for(var i = 0; i< data.length; i++){
					var user = SingleUser({
						username : data[i].username,
						logindate : getDate(),
					});
					user.addOnlineUserTable();
				}
			}else{
				
			}
		  //console.log(data);
		},
		error: function( data ) {
		  console.log(data);
		}
	});	
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

    $("#login-modal-content").height($(window).height());
    $("#login-modal-body").height($(window).height() - (94) );
    //$("#login-modal-body").height($(window).height() );
}

$(function() {
 
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
	
	var cusername = getCookie(COOKIE_NAME_USERNAME, null);
	if (cusername == null){
		$('#loginModol').modal('show');
		$("#btnEnter").on("click",function(){
			var username = $("#username").val();
			if(username){
				setCookie(COOKIE_NAME_USERNAME, username, 7);
				$('#loginModol').modal('hide');
				socket.connect(); 
				socket.emit('connected', username);
				userInput = username;
				sayWelcome();
			}else{
				console.log("enter valid username");
			}
		});
	}else{
		userInput = cusername;
		if (Notification.permission !== "granted")
			Notification.requestPermission();
		sayWelcome();
		socket.emit('connected', userInput);
	}
    
	
    $("#btnSettings").on("click", function() {
        $('#myModal').modal('show');
    });
	
	$("#whoisonline").on("click", function() {
        $('#onlineUsersModol').modal('show');
		getOnlineUsers();
    });
	
	$("#btnLogout").on("click", function() {
		socket.emit('disconnected', userInput);
		socket.disconnect(); 
		deleteCookie(COOKIE_NAME_USERNAME);
		userInput = null;
        $('#loginModol').modal('show');
		clearMessages();
    });
	
	resizeMessages();
});