// Dependencies
var express = require("express");
var enemies = require('./serverscripts/enemyData').enemies
require('dotenv').config()// Create an instance of the express app.
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var mongoose = require("mongoose");

var startTime = new Date()


var originalFloorData = require('./serverscripts/floorData').floors

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/Abyss";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
var db = require("./models");
// db.Record.save
// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = 3001;


//Initial values
var players = {};
var tombstones = []
var deaths = 0
var scene = 'floor4'
var enemyList = populateFloor(scene);
var projectiles ={}
var playerSpawnX = originalFloorData[scene].playerSpawnX
var playerSpawnY = originalFloorData[scene].playerSpawnY
var projectileIndex = {index: 0}



// app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/ClientOnly'));

//Allow static files in the public folder to be retrieved from server

app.get('/play', function (req, res) {
    res.sendFile(__dirname + '/public/game.html');
    // res.sendFile(__dirname + '/ClientOnly/index.html')
  });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
    // res.sendFile(__dirname + '/ClientOnly/index.html')
  });
var metadata = io.of('/metadata')
metadata.on('connection',function(socket){
    console.log('a user connected to /metadata')
    socket.emit('deathCount',deaths)
})
var gameRoom = io.of('gameRoom')
gameRoom.on('connection', function(socket){
    console.log('a user connected');
    // create a new player and add it to our players object
    var letters = '0123456789ABCDEF';
    var color = '0x'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    players[socket.id] = {
        rotation: 0,
        x: playerSpawnX,
        y: playerSpawnY,
        currentAnim: null,
        playerId: socket.id,
        nextFloor: false,
        alive: true,
        tint: color
    };
    socket.on('name',function(name){
        players[socket.id].name = name
        socket.broadcast.emit('newPlayer', players[socket.id]);
        socket.emit('currentPlayers', players);
    })
    // // send the players object to the new player
    // socket.emit('currentPlayers', players);
    // send the enemies list to the new player
    socket.emit('currentEnemies', enemyList);
    // send the current scene to the new player
    socket.emit('currentProjectiles', projectiles);
    // update all other players of the new player
    socket.emit('currentTombstones' , tombstones)
    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        gameRoom.emit('disconnect', socket.id);
    });

    socket.on('firstConnect',function(){
        socket.emit('changeScene',scene)
    })

    socket.on('playerDeath', function(playerId){
        deaths += 1
        players[playerId].alive = false
        tombstones.push({x: players[playerId].x,y: players[playerId].y})
        socket.broadcast.emit('playerDeath',playerId)
        metadata.emit('deathCount',deaths)
    })

    socket.on('playerMovement', function (movementData) {
        if(players[socket.id]){
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].rotation = movementData.rotation;
            players[socket.id].currentAnim = movementData.currentAnim
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
      });

    socket.on('enemyHit', function(enemyID,dir){
        if(enemyList[enemyID]){
            enemyList[enemyID].knockback(dir)
        }
    })


    socket.on('floorChange', function(newScene,id){
        //Check if all players are attempting to change floors
        scene=newScene
        var change = true
        if(players[id]){
            players[id].floorChange = true
        }

        //Check if all living players have made it to the door
        for(id in players){
            if (players[id].floorChange != true && players[id].alive){
                change = false
                break
            }
        }
        //Check if any enemies are still alive
        // for(id in enemyList){
        //     if(enemyList[id]){
        //         change = false
        //         break
        //     }
        // }
        if(change == true){
            enemyList = populateFloor(scene)
            tombstones = []
            playerSpawnX = originalFloorData[scene].playerSpawnX
            playerSpawnY = originalFloorData[scene].playerSpawnY
            gameRoom.emit('changeScene', scene)
        }
    })
});


update()
// Start our server so that it can begin listening to client requests.
server.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});

function update(){
    //Called every frame
    setTimeout(function(){
        for(key in enemyList){
            if(enemyList[key]){
                enemyList[key].update(players,enemyList,projectiles,projectileIndex)
                if(enemyList[key].boss){
                    gameRoom.emit('updateBossHealth',enemyList[key].health)
                    if(enemyList[key].health == 0){
                        gameRoom.emit('Victory')
                        db.Record.create({
                            deaths: deaths,
                            duration: new Date() - startTime,
                        })
                        setTimeout(function(){
                            scene = 'floor1'
                            deaths = 0;
                            tombstones = []
                            enemyList = populateFloor(scene)
                            startTime = new Date()
                            playerSpawnX = originalFloorData[scene].playerSpawnX
                            playerSpawnY = originalFloorData[scene].playerSpawnY
                            metadata.emit('deathCount',deaths)
                            function getConnectedSockets() {
                                var vals = Object.keys(gameRoom.connected).map(function(key) {
                                    return gameRoom.connected[key];
                                });
                                return vals
                            }
                            
                            getConnectedSockets().forEach(function(s) {
                                s.disconnect(true);
                            });
                        },5000)

                    }
                }
                if(enemyList[key].health <= 0){
                    delete enemyList[key]
                    gameRoom.emit('enemyDeath',key)
                }
            }
            
        }
        if(projectileIndex.index >= Number.MAX_SAFE_INTEGER-1000){
            projectileIndex.index = 0
        }
        for(key in projectiles){
            projectiles[key].update()
            if(projectiles[key].x < -50 || projectiles[key].x > 3000 || projectiles[key].y < -50 || projectiles[key].y > 3000){
                gameRoom.emit('projectileDeath',projectiles[key].id)
                delete projectiles[key]
            }
        }

        gameRoom.emit('updateEnemies',enemyList)
        gameRoom.emit('updateProjectiles', projectiles)

        update()
    }, 33)
}

function populateFloor(floor){
    var enemyList = []
    var enemyData = originalFloorData[floor].enemyList
    for(var i=0;i<enemyData.length;i++){
        var enemyConstructor = enemies[enemyData[i].name]
        enemyList.push(new enemyConstructor(enemyData[i].x,enemyData[i].y,enemyData[i].health,enemyData[i].id))
    }
    return enemyList
}

