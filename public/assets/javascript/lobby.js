class lobby extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'lobby' });
    }


    preload(){
    }

    create(){
        _this = this
        // socket = io('https://52.53.200.224:443')
        // socket = io('https://journeyabyss.com')
        socket = io()
        socket.on('changeScene',function(scene){
                socket.disconnect();
                _this.scene.start(scene);
        })
        socket.emit('firstConnect')
    }
}