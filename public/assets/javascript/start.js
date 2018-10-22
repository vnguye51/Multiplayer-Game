class start extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'start' });
        this.playerName = ''
        this.cursorBlink = 60

    }
    startGame(){
        playerName = this.playerName
        socket = io('/gameRoom')
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

        //Prevent default action of keys
        this.cursors = this.input.keyboard.addKeys({ 
            'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'delete': Phaser.Input.Keyboard.KeyCodes.BACKSPACE });

        //Startbutton
        this.nameInput = this.add.text(160,140,'Name: ',{fontSize: '16px'}).setOrigin(0.5,0.5)
        this.nameCursor = this.add.text(188,140, '|',{fontSize: '16px'}).setOrigin(0.5,0.5)
        this.startButton = this.add.text(160,90,'Start', {fontSize: '32px'}).setOrigin(0.5,0.5)
        this.startButton.setInteractive();
        this.startButton.on('pointerover', () => {this.startButton.setColor('#ff0000')})
        this.startButton.on('pointerout', () => {this.startButton.setColor('#ffffff')})
        this.startButton.on('pointerdown', () => {this.startGame()})

        //Define key inputs
        this.input.keyboard.on('keydown',(event) => {
            //On Alphabetical or Space 
            if((event.keyCode >= 65 && event.keyCode <=90) || event.keyCode == 32){
                if(this.playerName.length < 16){
                    this.playerName += event.key
                    this.nameInput.setText('Name: ' + this.playerName)
                    this.nameCursor.x += 5
                }
            }
            //On Backspace
            else if(event.keyCode == 8){
                if(this.playerName.length > 0){
                    this.playerName = this.playerName.slice(0,this.playerName.length-1)
                    this.nameInput.setText('Name: ' + this.playerName)
                    this.nameCursor.x -= 5
                }
            }
            else if(event.keyCode == 13){
                this.startGame()
            }
        })
    }

    update(){
        this.cursorBlink -= 1
        if(this.cursorBlink == 30){
            this.nameCursor.setVisible(false)
        }   
        if(this.cursorBlink == 0){
            this.nameCursor.setVisible(true)
            this.cursorBlink = 60
        }
    }
}