// Dependencies
var express = require("express");
var enemies = require('./public/assets/enemies/scripts/enemiesServer').enemies

// Create an instance of the express app.
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var originalFloorData = require('./serverscripts/floorData').floors
function populateFloor(floor){
    var enemyList = []
    var enemyData = originalFloorData[floor].enemyList
    for(var i=0;i<enemyData.length;i++){
        var enemyConstructor = enemies[enemyData[i].name]
        enemyList.push(new enemyConstructor(enemyData[i].x,enemyData[i].y,enemyData[i].health,enemyData[i].id))
    }
    return enemyList
}

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 4040;


var players = {};
var tombstones = []
var scene = 'floor1'
var enemyList = populateFloor(scene);
var projectileList = []
var playerSpawnX = originalFloorData[scene].playerSpawnX
var playerSpawnY = originalFloorData[scene].playerSpawnY


app.use(express.static(__dirname + '/public'));
//Allow static files in the public folder to be retrieved from server

app.get('/play', function (req, res) {
    res.sendFile(__dirname + '/public/game.html');
  });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

io.on('connection', function (socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: playerSpawnX,
        y: playerSpawnY,
        currentAnim: null,
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
    socket.emit('currentTombstones' , tombstones)
    socket.broadcast.emit('newPlayer', players[socket.id]);
    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    socket.on('firstConnect',function(){
        socket.emit('changeScene',scene)
    })

    socket.on('playerDeath', function(playerId){
        players[playerId].alive = false
        tombstones.push({x: players[playerId].x,y: players[playerId].y})
        socket.broadcast.emit('playerDeath',playerId)
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
            io.emit('changeScene', scene)
        }
    })
});


function update(){
    //Called every frame
    setTimeout(function(){
        for(key in enemyList){
            if(enemyList[key]){
                enemyList[key].update(players,enemyList,projectileList)
                if(enemyList[key].boss){
                    io.emit('updateBossHealth',enemyList[key].health)
                    if(enemyList[key].health == 0){
                        console.log('Victory!')
                        setTimeout(function(){
                            scene = 'floor1'
                            tombstones = []
                            enemyList = populateFloor(scene)
                            playerSpawnX = originalFloorData[scene].playerSpawnX
                            playerSpawnY = originalFloorData[scene].playerSpawnY
                            io.emit('Victory')
                        },5000)
                       
                    }
                }
                if(enemyList[key].health <= 0){
                    delete enemyList[key]
                    io.emit('enemyDeath',key)
                }
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
