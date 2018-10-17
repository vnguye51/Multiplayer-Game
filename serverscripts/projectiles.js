var linearProjectile = function (x,y,rot,speed,id){
    this.x = x
    this.y = y
    this.rot = rot
    this.speed = speed
    this.id = id

    this.update = function(){
        this.x += this.speed*Math.cos(rot)
        this.y +=  this.speed*Math.sin(rot)
    }
}

exports.projectiles = {
    linearProjectile: linearProjectile
}