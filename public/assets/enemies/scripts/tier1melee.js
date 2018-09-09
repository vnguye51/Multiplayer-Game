class Tier1Melee extends Phaser.Physics.Arcade.Sprite {

    constructor (scene, x, y)
    {   
        //Super grabs the constructor from the original class that this script extends
        super(scene, x, y);

        this.setTexture('enemy');
        this.setPosition(x, y);
    }
    create(){
        this.speed = 40
        this.state = 'seeking'
        this.seeking(this)
        this.setSize(12,12)
    }
    update(scene){
        if(this.state == 'seeking'){
            if(scene.player){
                var xdist = scene.player.x
                var ydist = scene.player.y
                var dist = Math.sqrt(Math.pow(xdist-this.x,2)+Math.pow(ydist-this.y,2))
                console.log(dist)

                if(dist < 100){
                    this.state = 'tracking'
                }
            }
        }
        if(this.state == 'tracking'){
            var theta = Phaser.Math.Angle.Between(this.x,this.y,scene.player.x,scene.player.y);
            var xvel = Math.cos(theta)
            var yvel = Math.sin(theta)
            this.setVelocityX(xvel*this.speed)
            this.setVelocityY(yvel*this.speed)
        }
    }
    seeking(_this){
        if(_this.state == 'seeking')
            setTimeout(function(){
                var direction = Math.floor(Math.random()*4)
                if(direction == 0){
                    _this.setVelocityY(0)
                    _this.setVelocityX(_this.speed)
                }
                else if(direction == 1){
                    _this.setVelocityY(0)
                    _this.setVelocityX(-_this.speed)
                }
                else if(direction == 2){
                    _this.setVelocityX(0)
                    _this.setVelocityY(_this.speed)
                }
                else if(direction == 3){
                    _this.setVelocityX(0)
                    _this.setVelocityY(-_this.speed)
                }
                _this.seeking(_this)
            },1000)
    }

}

