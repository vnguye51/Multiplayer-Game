
//Constructor for basic enemy
//Wanders around until a player enters its radius
//Then chases that player
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
    this.walkCounter = 30
    this.aggroTimer = 30


    this.update = function(players){
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
                if(this.target){
                    reAggro(this,players)
                    var uvec = unitVector(this.x,this.y,this.target.x,this.target.y)
                    this.xvel = uvec[0]*this.speed
                    this.yvel = uvec[1]*this.speed
                }
            }
            this.x += this.xvel
            this.y += this.yvel
        }
    }
}


function findClosest(x,y,players){
    //Loop through the players looking for the closest player
    var minDist = 9999
    var target = null
    for(id in players){
        //Pythag theorem to find distance
        var dist = Math.hypot((x-players[id].x),(y-players[id].y))
        if(dist < minDist){
            minDist = dist
            target=players[id]
        }
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
        }
        else if(direction == 1){
            _this.yvel = 0
            _this.xvel = -_this.speed
        }
        else if(direction == 2){
            _this.xvel = 0
            _this.yvel = _this.speed
        }
        else if(direction == 3){
            _this.xvel = 0
            _this.yvel = -_this.speed
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

exports.enemies = {
    Tier1Melee: Tier1Melee
}