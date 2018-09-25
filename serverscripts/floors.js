var enemies = require('../public/assets/enemies/scripts/enemiesServer.js').enemies


var enemyList = []

for(var i=0; i<3; i++){
    enemyList[i] = new enemies.Tier1Melee(100+100*i,400,3,i)
}


for(var i=0; i<3; i++){
    for(var j=0; j < 20; j++){
        enemyList[j+i*20+3] = new enemies.Bat(100+10*j,100+10*i,1,j+i*20+3)
    }
}
var floor1 = {
    enemyList: enemyList,
    playerSpawnX: 300,
    playerSpawnY: 300,
}

var floor2 = {
    enemyList: [new enemies.Tier1Melee(300,240,3,0)],
    playerSpawnX: 320,
    playerSpawnY: 32,
}

module.exports = {
    floor1: floor1,
    floor2: floor2}