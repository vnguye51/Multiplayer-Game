// Dependencies
var express = require("express");
// Create an instance of the express app.
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var collisionMap = require('./public/assets/tilemap/Map1.json')
// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 4040;


var players = {};
var enemies = {
    '0': {
        x: 120,
        y: 120,
        health: 3,
    }
};




app.use(express.static(__dirname + '/public'));
//Allow static files in the public folder to be retrieved from server

app.get('/', function (req, res) {
    console.log('file sent')
    res.sendFile(__dirname + '/index.html');
    
  });


io.on('connection', function (socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: 160,
        y: 160,
        playerId: socket.id,
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    socket.emit('currentEnemies', enemies);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
      });

    socket.on('enemyHit', function(enemyID){
        enemies[enemyID].health -= 1;
        if(enemies[enemyID].health <= 0){
            delete enemies[enemyID]
            socket.emit('enemyDeath',enemyID)
            socket.broadcastcast.emit('enemyDeath',enemyID)
        }
    })
    
});


// Start our server so that it can begin listening to client requests.
server.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});

function queryCollisions(width,height,xpos,ypos,xvel,yvel,map){
    //Horizontal Collision
    if (place_meeting(xpos+xvel,ypos,width,height,map)){	
        while(!place_meeting(xpos+xvel,ypos,width,height,map)){
            xpos += Math.sign(xvel);
        }
        xvel = 0
    }
    xpos += xvel;
    //Vertical Collision
    if (place_meeting(xpos+xvel,ypos,width,height,map)){	
        while(!place_meeting(xpos+xvel,ypos,width,height,map)){
            xpos += Math.sign(xvel);
        }
        xvel = 0
    }
    ypos += yvel
    return [xpos,ypos]
} 

function place_meeting(x,y, width, height,map){
    var queryX = []
    var queryY = []
    var x = x-Math.floor(width/2)
    var y = y-Math.floor(height/2)
    while(x <= map.tilewidth){
        var tiledposx = floor(x/map.tilewidth)
        queryX.push(tiledposx)
        x += map.tilewidth
    }
    while(y <= map.tilewidth){
        var tiledposy = floor(y/map.tileheight)
        queryY.push(tiledposy)
    }

    for(var i = 0; i<queryX.length; i++){
        for (var j = 0; i<queryY.length; j++){
            var tiledpos = queryY[j]*map.width + queryX[j]
            if(map.data.layers[0].data[tiledpos] != 0){
                return true  
            }
        }
    }
    return false
}
