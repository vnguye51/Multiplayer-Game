var enemies = require('../public/assets/enemies/scripts/enemiesServer.js').enemies


var enemyList1 = []

for(var i=0; i<3; i++){
    enemyList1[i] = new enemies.Tier1Melee(100+100*i,400,3,i)
}




var enemyList2 = []
for(var i=0; i<3; i++){
    for(var j=0; j < 20; j++){
        enemyList2[j+i*20+3] = new enemies.Bat(180+10*j,120+10*i,1,j+i*20+3)
    }
}

var enemyList3 = []


var enemyList4 = []
enemyList4[enemyList4.length] = new enemies.Whelp(300,140,5,enemyList4.length)


var floor1 = {
    enemyList: enemyList1,
    playerSpawnX: 318,
    playerSpawnY: 410,
}

var floor2 = {
    enemyList: enemyList2,
    playerSpawnX: 330,
    playerSpawnY: 460,
}

var floor3 = {
    enemyList: enemyList3,
    playerSpawnX: 30,
    playerSpawnY: 1260,
}

var floor4 = {
    enemyList: enemyList4,
    playerSpawnX: 316,
    playerSpawnY: 604,
}

Floors = function(){
    this.floor1 = floor1,
    this.floor2 = floor2,
    this.floor3 = floor3,
    this.floor4 = floor4
}

// module.exports = {
//     floor1: floor1,
//     floor2: floor2,
//     floor3: floor3,
//     floor4: floor4}

module.exports.Floors = Floors