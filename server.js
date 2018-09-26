// Dependencies
var express = require("express");
// Create an instance of the express app.
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var floors = require('./serverscripts/floors')
// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 4040;


var players = {};
var scene = 'floor1'
var enemyList = floors[scene].enemyList;
var projectileList = []
var playerSpawnX = floors[scene].playerSpawnX
var playerSpawnY = floors[scene].playerSpawnY


app.use(express.static(__dirname + '/public'));
//Allow static files in the public folder to be retrieved from server

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
    
  });


io.on('connection', function (socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: playerSpawnX,
        y: playerSpawnY,
        playerId: socket.id,
        nextFloor: false,
        alive: true,
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // send the enemies list to the new player
    socket.emit('currentEnemies', enemyList);
    // send the current scene to the new player
    socket.emit('currentProjectiles', projectileList);
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

    socket.on('playerDeath', function(playerId){
        players[playerId].alive = false
        socket.broadcast.emit('playerDeath',playerId)
    })

    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
      });

    socket.on('enemyHit', function(enemyID,dir){
        if(enemyList[enemyID]){
            enemyList[enemyID].knockback(dir)
            enemyList[enemyID].health -= 1;
            if(enemyList[enemyID].health <= 0){
                delete enemyList[enemyID]
                socket.emit('enemyDeath',enemyID)
                socket.broadcast.emit('enemyDeath',enemyID)
            }
        }
    })


    socket.on('floorChange', function(scene,id){
        //Check if all players are attempting to change floors
        var change = true
        players[id].floorChange = true
        for(id in players){
            if (players[id].floorChange != true){
                change = false
                break
            }
        }
        if(change == true){
            enemyList = floors[scene].enemyList
            playerSpawnX = floors[scene].playerSpawnX
            playerSpawnY = floors[scene].playerSpawnY
            io.emit('currentScene', scene)
            console.log(scene)
        }
    })
});


function update(){
    //Called every frame
    setTimeout(function(){
        for(key in enemyList){
            enemyList[key].update(players,enemyList,projectileList)
            if(enemyList[key].boss){
                io.emit('updateBossHealth',enemyList[key].health)
            }
        }
        for(key in projectileList){
            if(projectileList[key]){
                projectileList[key].update()
                if(projectileList[key].x < -50 || projectileList[key].x > 3000 || projectileList[key].y < -50 || projectileList[key].y > 3000){
                    io.emit('projectileDeath',key)
                    delete projectileList[key]
                }
            }
        }
        io.emit('updateEnemies',enemyList)
        io.emit('updateProjectiles', projectileList)
        update()
    }, 33)
}


update()

// Start our server so that it can begin listening to client requests.
server.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
