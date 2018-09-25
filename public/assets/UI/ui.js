class ui extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'UI' });
    }


    preload(){
        this.load.spritesheet('healthbar','assets/UI/heartshealth.png',{frameWidth: 36, frameHeight: 32})
    }

    create(){
        // healthbar = this.add.sprite(74,16,'healthbar',0)
        healthbar = this.add.group()
        healthbar.createMultiple({key: 'healthbar', frame: [0] , repeat:4})
        // healthbar.scaleX = 0.5
        // healthbar.scaleY = 0.5
        uiScene = this
        Phaser.Actions.SetXY(healthbar.getChildren(),12,12,20)
        healthbar.getChildren().forEach(function(child){
            child.scaleX = 0.5
            child.scaleY = 0.5
        })
    }
}