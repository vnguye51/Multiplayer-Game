class Tier1Melee extends Phaser.Physics.Arcade.Sprite {

    constructor (scene, x, y, health, id)
    {   
        //Super grabs the constructor from the original class that this script extends
        super(scene, x, y, health,id);

        // this.setTexture('bat');
        this.setPosition(x, y);
        this.id = id
    }
    create(){
        
        this.setSize(12,12)
    }

}

