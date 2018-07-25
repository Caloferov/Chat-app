var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cors = require('cors');
var fs = require('fs');

server.listen(80);
app.use(cors());

var clients = {};

io.sockets.on('connection', function (socket) {
    console.log('A user connected');

    socket.on('add-user', function (data) {
        clients[data.username] = {
            "socket": socket.id,
            "Usr": data.username
        };
    });

    socket.on('private-message', function (data, fn) {
        console.log(data.usr + " is sending: " + "'" + data.content + "'" + " to " + data.username);

        write(data.usr, data.content);

        if (clients[data.username]) {
            io.sockets.connected[clients[data.username].socket].emit("add-message", data);
            fn('Delivered!');
        } else {
            console.log("User does not exist: " + data.username);
        }
    });

    socket.on('broadcast', function (data) {
        write(data.usr, data.content);

        console.log("Broadcasting: " + data.content);

        socket.broadcast.emit('add-message', data);
    });

    //Removing the socket on disconnect
    socket.on('disconnect', function () {
        console.log('User disconnected');

        for (var name in clients) {
            if (clients[name].socket === socket.id) {
                delete clients[name];
                break;
            }
        }
    })
});

// Logging messages into a file 

//'user' is also passed to the function in case you want to log it
function write(user, content) {
    var oldFileContent = fs.readFileSync('.\\tmp\\messages.txt');
    var oldFileBytes = Buffer.byteLength(oldFileContent, 'utf8');
    var toWrite = content + "\r\n";
    var toWriteBytes = Buffer.byteLength(toWrite, 'utf8');

    if (oldFileBytes + toWriteBytes <= 100) {
        fs.appendFile('.\\tmp\\messages.txt', toWrite, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The messsage was logged!");
            
            fs.watchFile('.\\tmp\\messages.txt', function (curr, prev) {
                console.log("Previous filesize: " + prev.size);
                console.log("Current filesize: " + curr.size);
            });
        });
    } else {
        console.log("Logging cancelled because the filesize could exceed the limit!")
    }
}








