

class floor1 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'floor1' });
    }

    preload () //preload occurs prior to the scene(game) being instantiated
    {
        //Load player assets
        this.load.image('pointer', 'assets/CharacterSprites/pointer.png')
        this.load.spritesheet('player','assets/CharacterSprites/notlink.png',{frameWidth: 16,frameHeight:16})
        this.load.image('playerMeleeAttack', 'assets/items/woodSword.png')
        
        //Load enemy assets
        this.load.spritesheet('lancer','assets/enemies/sprites/lancer/lancer.png',{frameWidth: 16,frameHeight:16})
    
        //Load tilemap assets
        this.load.image('cave', 'assets/tilemap/cave.png')
        this.load.tilemapTiledJSON('map','assets/tilemap/Map1.json')
    
    }
    
    create () //Occurs when the scene is instantiated
    {
        _this = this
        //Assigns the input keys. 
        enemies = this.physics.add.group()

        definePlayerAnimations(this)

        this.cursors = this.input.keyboard.addKeys({ 
            'up': Phaser.Input.Keyboard.KeyCodes.W, 
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'attack': Phaser.Input.Keyboard.KeyCodes.SPACE });
        
        this.otherPlayers = this.physics.add.group()

        
        sockets();


        //camera
        this.cameras.main.setSize(320, 240);

        

        ////TILEMAP DATA
        map = this.make.tilemap({key: 'map'}) //Create tilemap
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
        objectLayer.setCollisionByExclusion([-1,53,69,85,100,101,102])
        objectLayer.setDepth(-1)
        objectLayer.setTileIndexCallback([53],function(){
            _this.player.stats.control = false
            _this.player.body.velocity.x = 0
            _this.player.body.velocity.y = 0
            _this.player.visible = false
            _this.socket.emit('floorChange','floor2',_this.socket.id)
        },this)

        // Locks pointer on mousedown
        game.canvas.addEventListener('mousedown', function () {
            game.input.mouse.requestPointerLock();
        });

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
    }
    
    update() //Update is called every frame
    {   // Only run update code once the player is connected
        if(this.player){
            if(this.player.stats.control == true){

                if (this.cursors.left.isDown){
                    this.player.setVelocityX(-120);
                    this.player.anims.play('left',true)
                    this.player.flipX = true
                    this.player.direction = 'left'
                }
                else if (this.cursors.right.isDown){
                    this.player.setVelocityX(120);
                    this.player.anims.play('right',true)
                    this.player.flipX = false
                    this.player.direction = 'right'

                }
                else{
                    this.player.setVelocityX(0);
                }
                if (this.cursors.up.isDown){
                    this.player.setVelocityY(-120);
                    this.player.anims.play('up',true)      
                    this.player.direction = 'up'      
                }
                else if (this.cursors.down.isDown){
                    this.player.setVelocityY(120);
                    this.player.anims.play('down',true)
                    this.player.direction = 'down'      

                }
                else{
                    this.player.setVelocityY(0);
                }
                if(!this.cursors.left.isDown && !this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown){
                    this.player.anims.stop()
                }
                if(this.cursors.attack.isDown && !spaceIsPressed){
                    meleeAttack()
                    spaceIsPressed = true
                }
                else if(!this.cursors.attack.isDown){
                    spaceIsPressed = false
                }
            }
            
            //player faces reticle
            var playerCoordX = this.player.x;
            var playerCoordY = this.player.y
    
    
            ////Emit Socket Signals////
            // emit player movement
            var x = this.player.x;
            var y = this.player.y;
            var rotation = this.player.rotation;
    
            //If player position changed
            if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || rotation !== this.player.oldPosition.rotation)) {
                _this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation});
            }
            
            // save old position data
            this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
            rotation: this.player.rotation,
            };
        }
    }
}

