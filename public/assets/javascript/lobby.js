class lobby extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'lobby' });
    }


    preload(){
    }

    create(){
        _this = this
        socket = io('http://52.53.39.113:80')
        socket.on('changeScene',function(scene){
                socket.disconnect();
                _this.scene.start(scene);
        })
        socket.emit('firstConnect')
    }
}