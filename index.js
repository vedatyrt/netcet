var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);



var path1 = __dirname + '/views/';

var currentUsers = new Array;

app.get('/', function(req, res) {
    res.sendFile(path1 + '/index.html');
});


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket) {
    socket.on('chat', function(msg) {
		msg.date = getDate();
        io.emit('chat', msg);
    });
    socket.on('connected', function(username) {
		if(currentUsers.indexOf(username) == -1){
			currentUsers.push(username);
			io.emit('connected', username);
		}else{
			io.emit('error', {"type" :"invalidusername" ,"message": "This username already taken : " + username});
		}	
    });
    socket.on('byby', function(username) {
		console.log(username + " ayrılıyor");
		if(currentUsers.indexOf(username) != -1){
			removeUser(username);
			io.emit('byby', username);
			console.log(username + " ayrıldı");
		}
    });
});

http.listen(881, function() {
    console.log('listening on *:881');
});


function removeUser(username){
	var newUserList = new Array;
	for(var i = 0; i< currentUsers.length; i++){
		if(currentUsers[i] != username)
			newUserList.push(currentUsers[i]);
	}
	currentUsers = newUserList;
	console.log("currentUsers :" + currentUsers);
}

function getDate(){
	var d = new Date();
	var h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	var m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	var s = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	return h + ":" + m + ":" + s;
}