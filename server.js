// Dependencies
var express = require("express");

// Create an instance of the express app.
var app = express();
var server = require('http').Server(app);
// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 4040;

app.use(express.static(__dirname + '/public'));
//Allow static files in the public folder to be retrieved from server

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    console.log('file sent')
  });

// Start our server so that it can begin listening to client requests.
server.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
