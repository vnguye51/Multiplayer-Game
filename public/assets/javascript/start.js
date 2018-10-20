class start extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'start' });
        this.playerName = ''
    }

    startGame(){
        playerName = this.playerName
        socket = io()
        socket.on('changeScene',function(scene){
                socket.disconnect();
                _this.scene.start(scene);
        })
        socket.emit('firstConnect')
    }

    preload(){
    }

    create(){
        _this = this
       
        this.startButton = this.add.text(160,90,'Start', {fontSize: '16px'}).setOrigin(0.5,0.5)
        this.startButton.setInteractive();
        this.startButton.on('pointerover', () => {this.startButton.setColor('#ff0000')})
        this.startButton.on('pointerout', () => {this.startButton.setColor('#ffffff')})
        this.startButton.on('pointerdown', () => {this.startGame()})
    }
}