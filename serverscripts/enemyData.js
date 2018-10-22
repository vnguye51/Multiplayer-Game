
//Constructor for basic enemy
//Wanders around until a player enters its radius
//Then chases that player
var projectileData = require('./projectiles.js').projectiles

function joinCollisionLayers(layers){
    var collisionArray = []
    for(var i = 0; i < layers[0].data.length; i++){
        var found = false
        for(j = 0; j < layers.length; j++){
            if(layers[j].data[i] != 0){
                collisionArray.push(1)   
                found = true
                break
            }
        }
        if(!found){
            collisionArray.push(0)
        }
    }
    return collisionArray
}

var collisionMap = require('../public/assets/tilemap/Map1.json')
var collisionArray = (joinCollisionLayers([collisionMap.layers[1],collisionMap.layers[2]]))

Tier1Melee = function(x,y,health,id){   
    this.x = x
    this.y = y
    this.xvel = 0
    this.yvel = 0
    this.health = health
    this.id = id
    this.speed = 1
    this.state = 'seeking'
    this.target = null
    this.animation = 'lancerLeft'
    this.walkCounter = 30
    this.aggroTimer = 30
    this.control = true
    this.knockbacked = false
    this.knocbackCounter = 5
    this.knockback = function(dir){
        this.control = false
        this.xvel = 5
        this.yvel = 0
        this.knocbackCounter = 5
        this.knockbacked = true

        if(dir == 'left'){
            this.xvel = -5
            this.yvel = 0
        }
        else if (dir == 'right'){
            this.xvel = 5
            this.yvel = 0
        }
        else if (dir == 'down'){
            this.xvel = 0
            this.yvel = 5
        }
        else{
            this.xvel = 0
            this.yvel = -5
        }
    }
    this.update = function(players){
        if(this.control){
            if(Object.keys(players).length!=0){
                if(this.state == 'seeking'){
                    var data = findClosest(this.x,this.y,players)
                    var candidate = data[1]
                    var dist = data[0]
                    if(dist<100){
                        this.target = candidate
                        this.state = 'aggro'
                    }
                    else{
                        randomWalk(this)
                    }
                }
                else if(this.state == 'aggro'){
                    if(this.target && this.target.x && this.target.alive){
                        reAggro(this,players)
                        if(this.target){
                            var uvec = unitVector(this.x,this.y,this.target.x,this.target.y)
                        }
                        if(Math.abs(uvec[0]) > Math.abs(uvec[1])){
                            if(uvec[0] > 0){
                                this.animation = 'lancerRight'
                            }
                            else{
                                this.animation = 'lancerLeft'
                            }
                        }
                        else{
                            if(uvec[1] > 0){
                                this.animation = 'lancerDown'
                            }
                            else{
                                this.animation = 'lancerUp'
                            }
                        }
                        this.xvel = uvec[0]*this.speed
                        this.yvel = uvec[1]*this.speed
                    }
                    else{
                        this.state = 'seeking'
                    }
                }
    
            }
        }
        if(this.knockbacked){
            this.knocbackCounter -= 1
            if (this.knocbackCounter == 0){
                this.control = true
                this.knockbacked = false
                this.health -= 1

            }
        }
        var finalPos = queryCollisions(16,16,this.x,this.y,this.xvel,this.yvel,collisionMap,collisionArray)
        this.x = finalPos[0]
        this.y = finalPos[1]
    }
}

Bat = function (x,y,health,id){
    this.x = x
    this.y = y
    this.xvel = 0
    this.yvel = 0
    this.health = health
    this.id = id
    this.speed = 2
    this.state = 'seeking'
    this.target = null
    this.animation = 'bat'
    this.aggroTimer = 60
    this.control = true
    this.knockbacked = false
    this.knocbackCounter = 5
    this.cooldownTimer = 90
    this.knockback = function(dir){
        this.control = false
        this.xvel = 5
        this.yvel = 0
        this.knocbackCounter = 5
        this.knockbacked = true

        if(dir == 'left'){
            this.xvel = -5
            this.yvel = 0
        }
        else if (dir == 'right'){
            this.xvel = 5
            this.yvel = 0
        }
        else if (dir == 'down'){
            this.xvel = 0
            this.yvel = 5
        }
        else{
            this.xvel = 0
            this.yvel = -5
        }
    }
    this.update = function(players){
        if(this.control){
            if(Object.keys(players).length!=0){
                if(this.state == 'seeking'){
                    var data = findClosest(this.x,this.y,players)
                    var candidate = data[1]
                    var dist = data[0]
                    if(dist<100){
                        this.target = candidate
                        this.targetX = candidate.x
                        this.targetY = candidate.y
                        this.state = 'aggro'
                        var uvec = unitVector(this.x,this.y,this.target.x,this.target.y)
                        this.xvel = uvec[0]*this.speed
                        this.yvel = uvec[1]*this.speed
                    }
                }
                else if(this.state == 'cooldown'){
                    this.cooldownTimer -= 1
                    if(this.cooldownTimer == 0){
                        var data = findClosest(this.x,this.y,players)
                        var candidate = data[1]
                        this.target = candidate
                        this.state = 'aggro'
                        this.cooldownTimer = 90
                        if(this.target != null){
                            var uvec = unitVector(this.x,this.y,this.target.x,this.target.y)
                            this.xvel = uvec[0]*this.speed
                            this.yvel = uvec[1]*this.speed
                        }
                    } 
                }
                else if(this.state == 'aggro'){                        
                    this.aggroTimer -= 1
                    if(this.aggroTimer == 0){
                        this.aggroTimer = 60
                        this.xvel = 0
                        this.yvel = 0
                        this.state = 'cooldown'
                    }
                }
            }
        }
        if(this.knockbacked){
            this.knocbackCounter -= 1
            if (this.knocbackCounter == 0){
                this.control = true
                this.knockbacked = false
                this.health -= 1
            }
        }
        this.x += this.xvel
        this.y += this.yvel
    }
}

Whelp = function (x,y,health,id){
    this.boss = true
    this.x = x
    this.y = y
    this.xvel = 0
    this.yvel = 0
    this.health = health
    this.id = id
    this.speed = 2
    this.state = 'seeking'
    this.target = null
    this.animation = 'whelpIdle'
    this.aggroTimer = 60
    this.control = true
    this.knockbacked = false
    this.knocbackCounter = 5
    this.cooldownTimer = 90
    this.fireTimer = 120
    this.pattern = 0
    this.attackRot = 0
    this.knockback = function(dir){
        this.health -= 1
    }

    this.update = function(players,enemyList,projectiles,projectileIndex){
        if(this.control){
            if(Object.keys(players).length!=0){
                if(this.state == 'seeking'){
                    var data = findClosest(this.x,this.y,players)
                    var candidate = data[1]
                    var dist = data[0]
                    if(dist<100){
                        this.target = candidate
                        this.targetX = candidate.x
                        this.targetY = candidate.y
                        this.state = 'aggro'
                        var uvec = unitVector(this.x,this.y,this.target.x,this.target.y)
                        this.xvel = uvec[0]*this.speed
                        this.yvel = uvec[1]*this.speed
                    }
                }
                else if(this.state == 'cooldown'){
                    this.cooldownTimer -= 1
                    if(this.cooldownTimer == 0){
                        var data = findClosest(this.x,this.y,players)
                        var candidate = data[1]
                        this.target = candidate
                        this.state = 'aggro'
                        this.cooldownTimer = 90
                        if(this.target != null){
                            var uvec = unitVector(this.x,this.y,this.target.x,this.target.y)
                            this.xvel = uvec[0]*this.speed
                            this.yvel = uvec[1]*this.speed
                        }
                    } 
                }
                else if(this.state == 'aggro'){                        
                    this.aggroTimer -= 1
                    if(this.aggroTimer == 0){
                        this.aggroTimer = 60
                        this.xvel = 0
                        this.yvel = 0
                        this.state = 'fire'
                    }
                }
                else if(this.state == 'fire'){
                    this.fireTimer -= 1
                    if(this.pattern == 0){
                        if(this.fireTimer % 20 == 0){
                            if(this.target != null){
                                this.attackRot = angleBetween(this.x,this.y,this.target.x,this.target.y)
                            }
                            projectiles[projectileIndex.index]=(new projectileData.linearProjectile(this.x,this.y,this.attackRot,4,projectileIndex.index));projectileIndex.index++;
                            projectiles[projectileIndex.index]=(new projectileData.linearProjectile(this.x,this.y,this.attackRot+Math.PI/3,4,projectileIndex.index));projectileIndex.index++;
                            projectiles[projectileIndex.index]=(new projectileData.linearProjectile(this.x,this.y,this.attackRot-Math.PI/3,4,projectileIndex.index));projectileIndex.index++;

                        }
                    }
                    else if(this.pattern == 1){
                        if(this.fireTimer % 5 == 0){
                            projectiles[projectileIndex.index]=(new projectileData.linearProjectile(this.x,this.y,this.attackRot,4,projectileIndex.index));projectileIndex.index++;
                            projectiles[projectileIndex.index]=(new projectileData.linearProjectile(this.x,this.y,this.attackRot + Math.PI,4,projectileIndex.index));projectileIndex.index++;
                            this.attackRot += 2*Math.PI/24
                        }
                    }

                    else if(this.pattern == 2){
                        if(this.fireTimer % 3 ==0){
                            if(this.target != null){
                                this.attackRot = angleBetween(this.x,this.y,this.target.x,this.target.y)
                            }
                            projectiles[projectileIndex.index]=(new projectileData.linearProjectile(this.x,this.y,this.attackRot,6,projectileIndex.index));projectileIndex.index++;
                        }
                    }

                    if(this.fireTimer == 0){
                        this.fireTimer = 120
                        this.state = 'cooldown'
                        this.pattern += 1
                        if(this.pattern == 3){
                            this.pattern = 0
                        }
                    }
                }
            }
        }

        this.x += this.xvel
        this.y += this.yvel
    }
}

function findClosest(x,y,players){
    //Loop through the players looking for the closest player
    var minDist = 9999
    var target = null
    for(id in players){
        if(players[id].alive){
            var dist = Math.hypot((x-players[id].x),(y-players[id].y))
            if(dist < minDist){
                minDist = dist
                target=players[id]
            }
        }
        //Pythag theorem to find distance
    }
    return [minDist,target]

}

function angleBetween(x0,y0,x1,y1){
    var xdelta = x1-x0
    var ydelta = y1-y0
    var theta = Math.atan(ydelta/xdelta)

    //ArcTan only gives results in Q1 and Q4 so we have to determine which quadrants we are working in
    if(xdelta < 0){
        return Math.PI + theta 
    }
    if(xdelta >= 0){
        return theta
    }
    return 
}

function unitVector(x0,y0,x1,y1){
    var theta = angleBetween(x0,y0,x1,y1)
    return [Math.cos(theta),Math.sin(theta)]
}

function randomWalk(_this){
    if(_this.walkCounter > 0){
        _this.walkCounter -= 1
    }
    if(_this.walkCounter == 0){
        var direction = Math.floor(Math.random()*4)
        if(direction == 0){
            _this.yvel = 0
            _this.xvel = _this.speed
            _this.animation = 'lancerRight'
        }
        else if(direction == 1){
            _this.yvel = 0
            _this.xvel = -_this.speed
            _this.animation = 'lancerLeft'

        }
        else if(direction == 2){
            _this.xvel = 0
            _this.yvel = _this.speed
            _this.animation = 'lancerDown'

        }
        else if(direction == 3){
            _this.xvel = 0
            _this.yvel = -_this.speed
            _this.animation = 'lancerUp'

        }
        else if(direction == 4){
            _this.xvel = 0
            _this.yvel = 0
        }
        _this.walkCounter = 30
    }
}


function reAggro(_this,players){
    _this.aggroTimer -= 1
    if(_this.aggroTimer == 0){
        _this.target = findClosest(_this.x,_this.y,players)[1]
        _this.aggroTimer = 30
    }
}

function place_meeting(x,y, width, height,map,collisionArray){
    //Algorithm:
    //Define a rectangle using startpos(x,y) and width and height
    //A rectangle is defined by four points (x0,y0),(x0,y1),(x1,y0),(x1,y1)
    //Do a nested for loop through starting at (x0,y0) up to (x1,y1) with steps of the tilemap width/height
    //If any tiles are found(nonzero) then return true
    //If the loop completes return  false


    //Define the rectangle
    var x0 = x-Math.floor(width/2);
    var y0 = y-Math.floor(height/2);
    var x1 = x + Math.floor(width/2);
    var y1 = y + Math.floor(height/2);
    xcorners = [x0,x1]
    ycorners = [y0,y1]

    function queryTile(x,y,map,collisionArray){
        var tiledX = Math.floor(x/map.tilewidth);
        var tiledY = Math.floor(y/map.tileheight);
        tilePos = tiledX + tiledY * (map.width)
        return collisionArray[tilePos] 
    }

    // Check corners
    for(var i = 0; i < xcorners.length; i++){
        for(var j = 0; j < ycorners.length; j++){
            var tile = queryTile(xcorners[i],ycorners[j],map,collisionArray)
            if(tile != null && tile != 0){
                return true
            }
        }
    }

    // Check positions inside the object
    for(var x = x0; x<x1; x+=map.tilewidth){
        for (var y = y0; y<y1; y+=map.tileheight){
            var tile = queryTile(x,y,map,collisionArray)
            if(tile != null && tile != 0){
                return tile
            }
        }
    }

    return false
}

function queryCollisions(width,height,xpos,ypos,xvel,yvel,map,collisionArray){
    //Horizontal Collision
    if (place_meeting(xpos+xvel,ypos,width,height,map,collisionArray)){	
        while(!place_meeting(xpos+xvel,ypos,width,height,map,collisionArray)){
            xpos += Math.sign(xvel);
        }
        xvel = 0
    }
    xpos += xvel;
    //Vertical Collision
    if (place_meeting(xpos,ypos+yvel,width,height,map,collisionArray)){	
        while(!place_meeting(xpos,ypos+yvel,width,height,map,collisionArray)){
            ypos += Math.sign(yvel);
        }
        yvel = 0
    }
    ypos += yvel
    return [xpos,ypos]
} 

exports.enemies = {
    Tier1Melee: Tier1Melee,
    Bat: Bat,
    Whelp: Whelp
}

