

class floor2 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'floor2' });
    }

    preload () //preload occurs prior to the scene(game) being instantiated
    {
        //Load player assets
        this.load.image('tombstone','assets/items/tombstone.png')
        this.load.spritesheet('player','assets/CharacterSprites/notlink.png',{frameWidth: 16,frameHeight:16})
        this.load.image('playerMeleeAttack', 'assets/items/woodSword.png')
        
        //Load enemy assets
        this.load.spritesheet('lancer','assets/enemies/sprites/lancer/lancer.png',{frameWidth: 16,frameHeight:16})
        this.load.spritesheet('bat','assets/enemies/sprites/bat/bat.png',{frameWidth:16,frameHeight:16})
        
        //Load enemy assets
    
        //Load tilemap assets
        this.load.image('cave', 'assets/tilemap/cave.png')
        this.load.tilemapTiledJSON('floor2','assets/tilemap/Floor2.json')
    
    }
    
    create () //Occurs when the scene is instantiated
    {
        this.scene.launch('UI')
        _this = this
        //Assigns the input keys. 
        enemies = this.physics.add.group()
        enemyAttackGroup = this.physics.add.group()
        enemyProjectiles = this.physics.add.group()


        definePlayerAnimations(this)

        this.cursors = this.input.keyboard.addKeys({ 
            'up': Phaser.Input.Keyboard.KeyCodes.W, 
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'attack': Phaser.Input.Keyboard.KeyCodes.SPACE });
        
        this.otherPlayers = this.physics.add.group()

        
        sockets();

        //nametag
        this.nametag = this.add.text(0,0,playerName,{fontSize: '10px'}).setOrigin(0.5,0.5)

        //camera
        this.cameras.main.setSize(320, 240);
        this.cameras.main.setBounds(0,0,640,480)

        

        ////TILEMAP DATA
        map = this.make.tilemap({key: 'floor2'}) //Create tilemap
        var tileset = map.addTilesetImage('cave') //Use the tileset(must be the same name as the one in the Tiled editor)

        //Create the layers
        groundLayer = map.createStaticLayer('Ground',tileset, 0,0)
        groundLayer.setDepth(-3)

        wallLayer = map.createStaticLayer('Walls',tileset,0,0)
        wallLayer.setDepth(-2)
        wallLayer.setCollisionByExclusion([-1]) //Sets collision with all tiles on this layer(an array containing the ID of exception tiles can be passed)
        //ID is found in the tiled editor or the json. IDs are mis-indexed by +1 i.e. 68 in Tiled should be 69 in phaser
        //Passing -1 selects all tiles except the rest of the tiles in the array.


        objectLayer = map.createStaticLayer('Objects',tileset,0,0)
        objectLayer.setCollisionByExclusion([-1,21,37])
        objectLayer.setTileIndexCallback([21],function(){
            _this.player.stats.control = false
            _this.player.body.velocity.x = 0
            _this.player.body.velocity.y = 0
            _this.player.visible = false
            socket.emit('floorChange','floor4',socket.id)
        },this)

        objectLayer.setDepth(-1)

        //Player Inputs go here

       //Enemy Animations
       this.anims.create({
        key: 'lancerDown',
        frames: this.anims.generateFrameNumbers('lancer', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
        })
        this.anims.create({
            key: 'lancerRight',
            frames: this.anims.generateFrameNumbers('lancer', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'lancerLeft',
            frames: this.anims.generateFrameNumbers('lancer', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'lancerUp',
            frames: this.anims.generateFrameNumbers('lancer', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'bat',
            frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        })

    }
    
    update() //Update is called every frame
    {   // Only run update code once the player is connected
        if(this.player){
            socket.emit('playerMovement', { x: _this.player.x, y: _this.player.y, rotation: _this.player.rotation, currentAnim: _this.player.currentAnim});

            if(this.player.stats.control == true){

                if (this.cursors.left.isDown){
                    this.player.setVelocityX(-120);
                    this.player.anims.play('left',true)
                    this.player.currentAnim = 'left'
                    this.player.flipX = true
                    this.player.direction = 'left'
                }
                else if (this.cursors.right.isDown){
                    this.player.setVelocityX(120);
                    this.player.anims.play('right',true)
                    this.player.flipX = false
                    this.player.direction = 'right'
                    this.player.currentAnim = 'right'

                }
                else{
                    this.player.setVelocityX(0);
                }
                if (this.cursors.up.isDown){
                    this.player.setVelocityY(-120);
                    this.player.anims.play('up',true) 
                    this.player.currentAnim = 'up'
     
                    this.player.direction = 'up'      
                }
                else if (this.cursors.down.isDown){
                    this.player.setVelocityY(120);
                    this.player.anims.play('down',true)
                    this.player.currentAnim = 'down'
                    this.player.direction = 'down'      

                }
                else{
                    this.player.setVelocityY(0);
                }
                if(!this.cursors.left.isDown && !this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown){
                    this.player.anims.stop()
                    this.player.currentAnim = null
                }
                if(this.cursors.attack.isDown && !spaceIsPressed){
                    meleeAttack()
                    spaceIsPressed = true
                }
                else if(!this.cursors.attack.isDown){
                    spaceIsPressed = false
                }
            }
            //Nametag follows player
            this.nametag.x = this.player.x
            this.nametag.y = this.player.y+20
        }
    }
}
