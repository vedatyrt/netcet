var userInput = null;
var window_focus = true;
var notificationStack = new Array;
var socket = io();

function handleResize() {
	$("#chatdiv").height($(window).height() - ($("form").height() + 40));
}

function getUsername(){
	while (!userInput) {
		userInput = window.prompt("Enter Your Username ", "");
	}
	socket.emit('connected', userInput);
}

$('form').submit(function() {	
	if($('#m').val()){
		var message = {
			"user": userInput,
			msg: $('#m').val(),
		};
		socket.emit('chat', message);
		$('#m').val('');
	}
	return false;
});

socket.on('chat', function(message) {
	$('#messagesBox').append(getMessageDiv(message,userInput));
	
	if(message.user != userInput)
		notifyUser(message);
	scroll();
});

socket.on('connected', function(username) {
	if (username != userInput)
		$('#messagesBox').append('<div><div class="onemessage infomessage" user="'+ username +'">' + ' # ' + username + ' geçerken uğradı.' + '</div></div>');
	scroll();
});

socket.on('byby', function(username) {
	if (username != userInput)
		$('#messagesBox').append('<div><div class="onemessage infomessage" user="'+ username +'">' + ' # ' + username + ' terketti buraları.' + '</div></div>');
	scroll();
});

socket.on('error', function(err) {
	alert(err.message);
	//if(err.type = "invalidusername")
	//	getUsername();
});

function getMessageDiv(message,user){
	var clazz = "", content = "",divMessage = "";
	if (message.user == userInput){
		clazz = "onemessage mymessage";
		content = message.msg;
		divMessage = '<div align="right" user="' + message.user + '">' + content + ' [' + message.date + ']' + '</div>';
	}
	else{
		clazz = "onemessage othersmessage";
		content = message.user + ' > ' + message.msg;
		divMessage = '<div user="' + message.user + '"> [' + message.date + '] ' + content + '</div>';
	}
	
	var divAll = '<div class="' + clazz + '">' + divMessage + '</div>';
	
	return divAll;
}

function scroll(){
	var textdiv = $("#messagesBox");
	var chatdiv = $("#chatdiv");
	console.log(textdiv.height());
    chatdiv.scrollTop(textdiv.outerHeight());
}

function notifyUser(message) {
	
	if (!Notification) {
		alert('Desktop notifications not available in your browser. Try Chromium.'); 
		return;
	}

	if (Notification.permission !== "granted")
		Notification.requestPermission();
	else {
		var notification = new Notification('8.80 - ' + message.user, {
			icon: '/images/netcetlogo.png',
			body: message.date + " " + message.msg,
		});

		notification.onclick = function () {

			window.focus(); notification.close();
			for(var i = 0;i < notificationStack.length; i++)
				notificationStack[i].close();
			notificationStack = new Array();
		};
		notificationStack.push(notification);
	}
}

$(function(){
	handleResize();
	
	window.addEventListener("resize", handleResize);
	
	window.onblur = function (){
		window_focus = false;
	}
	
	window.onfocus = function (){
		window_focus = true;
	}
	
	window.onbeforeunload = function () {
        socket.emit('byby', userInput);
    }
	
	getUsername();

	if (Notification.permission !== "granted")
		Notification.requestPermission();
		
});
