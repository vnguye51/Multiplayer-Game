

var enemyList1 = []

function spawnNine(x0,y0,list,name){
    for(var i=0; i<3; i++){
        for(var j=0;j<3;j++){
            list.push({
                x: x0+16*i,
                y: y0+16*j,
                health:3,
                id: list.length,
                name: name
            })
        }
    }
}


spawnNine(140,200,enemyList1,'Tier1Melee')
spawnNine(460,300,enemyList1,'Tier1Melee')
spawnNine(300,106,enemyList1,'Tier1Melee')
spawnNine(260,132,enemyList1,'Tier1Melee')   
spawnNine(140,100,enemyList1,'Tier1Melee')
spawnNine(100,300,enemyList1,'Tier1Melee')

var enemyList2 = []
function spawnSixty(x0,y0,list,name){
    for(var i=0; i<3; i++){
        for(var j=0; j < 20; j++){
            list.push({
                x: x0+10*j,
                y: y0+10*i,
                health: 1,
                id: list.length,
                name: name
            })
        }
    }
}
spawnSixty(240,120,enemyList2,'Bat')
spawnSixty(240,180,enemyList2,'Bat')
spawnSixty(240,240,enemyList2,'Bat')


var enemyList3 = []


var enemyList4 = []
enemyList4[enemyList4.length] = {
    x: 300,
    y: 140,
    // health: 1,
    health: 80,
    id: enemyList4.length,
    name: 'Whelp'
}


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



module.exports.floors = {
    floor1: floor1,
    floor2: floor2,
    floor3: floor3,
    floor4: floor4
}

