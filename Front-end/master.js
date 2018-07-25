var socket = io.connect('http://localhost');

window.onload = function () {
    if (localStorage.getItem("hasCodeRunBefore") === null) {
        showDialog();
        localStorage.setItem("hasCodeRunBefore", true);
    }
}

function showDialog() {
    document.getElementById("dialog").showModal();
}

var usr;
var rcp;
var msg;

function sendUser() {
    usr = $('#username').val();
    // Tell the server about it
    socket.emit("add-user", { "username": usr });

    document.getElementById("dialog").close();
}

function sendMessage() {
    rcp = $('#recipient').val();
    msg = $('#message').val();

    // Send the message to the server
    socket.emit("private-message", {
        "username": rcp,
        "content": msg,
        "usr": usr
    }, function (data) {
        // Last message was delivered = data
        $("#messages:last-child").append($('<span>').css('color', "#4CAF50").text(" delivered"))
            .append($('<br>'));
    });

    // Empty the form
    $('#message').val('');

    // You've sent...
    $("#messages").append($("<li>", {
        "text": usr + " to " + rcp + ": " + msg
    }));
}

function broadcast() {
    msg = $('#message').val();

    // Send the message to the server
    socket.emit("broadcast", {
        "content": msg,
        "usr": usr + " is broadcasting"
    });

    // You've sent...
    $("#messages").append($("<li>", {
        "text": "You are broadcasting: " + msg
    }));
}

// Whenever we receieve a message, we append it to the <ul>
socket.on("add-message", function (data) {
    $("#messages").append($("<li>", {
        "text": data.usr + ": " + data.content
    }));
});