class ui extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'UI' });
    }

    preload(){
        this.load.spritesheet('healthbar','assets/UI/heartshealth.png',{frameWidth: 36, frameHeight: 32})
        this.load.image('button','assets/UI/Button.png')
        this.load.image('buttonpressed','assets/UI/ButtonPressed.png')
    }

    create(){
        uiScene = this
        uiScene.deathText = uiScene.add.text(6,80,'    YOU DIED     ',{fontSize: '32px'})
        uiScene.deathText.setInteractive();
        uiScene.deathText.setVisible(false)

        uiScene.resetButton = uiScene.add.text(106,116,' Try Again', {fontSize: '16px'})
        uiScene.resetButton.setInteractive();
        uiScene.resetButton.setVisible(false)
        // uiScene.resetButton.setActive(false)
        uiScene.resetButton.on('pointerover', () => {uiScene.resetButton.setColor('#ff0000')})
        uiScene.resetButton.on('pointerout', () => {uiScene.resetButton.setColor('#ffffff')})
        uiScene.resetButton.on('pointerdown', () => {reset()})

        // healthbar = this.add.sprite(74,16,'healthbar',0)
        
        healthbar = this.add.group()
        healthbar.createMultiple({key: 'healthbar', frame: [0] , repeat:4})
        // healthbar.scaleX = 0.5
        // healthbar.scaleY = 0.5
        Phaser.Actions.SetXY(healthbar.getChildren(),12,12,20)
        healthbar.getChildren().forEach(function(child){
            child.scaleX = 0.5
            child.scaleY = 0.5
        })


    }
}