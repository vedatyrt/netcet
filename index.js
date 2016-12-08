var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var path = __dirname + '/views/';

app.get('/', function(req, res) {
    res.sendFile(path + '/index.html');
});

io.on('connection', function(socket) {
    socket.on('chat', function(msg) {
        io.emit('chat', msg);
    });
    socket.on('connected', function(msg) {
        io.emit('connected', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});