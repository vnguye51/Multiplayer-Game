class lobby extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'lobby' });
    }

    startGame(){
        playerName = this.playerName
    }

    preload(){
    }

    create(){
        _this = this
        // socket = io('https://52.53.200.224:443')
        socket = io('https://journeyabyss.com')
        // socket = io()
        socket.on('changeScene',function(scene){
                socket.disconnect();
                _this.scene.start(scene);
        })
        socket.emit('firstConnect')
        uiScene.resetButton = uiScene.add.text(106,116,' Try Again', {fontSize: '16px'})
        uiScene.resetButton.setInteractive();
        uiScene.resetButton.setVisible(false)
        // uiScene.resetButton.setActive(false)
        uiScene.resetButton.on('pointerover', () => {console.log('hi');uiScene.resetButton.setColor('#ff0000')})
        uiScene.resetButton.on('pointerout', () => {uiScene.resetButton.setColor('#ffffff')})
        uiScene.resetButton.on('pointerdown', () => {reset()})
    }
}