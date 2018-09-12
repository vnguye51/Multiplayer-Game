var enemies = require('../public/assets/enemies/scripts/enemiesServer.js').enemies


var enemyList = []

for(var i=0; i<3; i++){
    enemyList[i] = new enemies.Tier1Melee(100+100*i,400,3,i)
}

var floor1 = {
    enemyList: enemyList,
    playerSpawnX: 300,
    playerSpawnY: 300,
}

module.exports.floor1 = floor1