

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
        this.load.image('playerAttack','assets/CharacterSprites/attack-tri.png')
        this.load.image('playerMeleeAttack', 'assets/CharacterSprites/MeleeAttack.png')
        
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

        this.cursors = this.input.keyboard.addKeys({ 
            'up': Phaser.Input.Keyboard.KeyCodes.W, 
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'attack': Phaser.Input.Keyboard.KeyCodes.SPACE });
        
        this.otherPlayers = this.physics.add.group()

        
        sockets();

    
        reticle = this.physics.add.sprite(180, 120, 'pointer');

        //camera
        this.cameras.main.setSize(400, 300);

        

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
        //Player Inputs go here
        // Locks pointer on mousedown
        game.canvas.addEventListener('mousedown', function () {
            game.input.mouse.requestPointerLock();
        });

        // Exit pointer lock when Q or escape (by default) is pressed.
        this.input.keyboard.on('keydown_Q', function (event) {
            if (game.input.mouse.locked)
                game.input.mouse.releasePointerLock();
        }, 0, this);

        // Move reticle upon locked pointer move
        this.input.on('pointermove', function (pointer) {
            if (this.input.mouse.locked)
            {
                reticle.x += pointer.movementX;
                reticle.y += pointer.movementY;
            }
        }, this);

        ///ANIMATIONS///

        ///Player Animations///
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'attackUp',
            frames: this.anims.generateFrameNumbers('player', {start: 12,end: 12}),
            frameRate: 3,
        })

        this.anims.create({
            key: 'attackLeft',
            frames: this.anims.generateFrameNumbers('player', {start: 13,end: 13}),
            frameRate: 3,
        })

        this.anims.create({
            key: 'attackRight',
            frames: this.anims.generateFrameNumbers('player', {start: 13,end: 13}),
            frameRate: 3,
        })

        this.anims.create({
            key: 'attackDown',
            frames: this.anims.generateFrameNumbers('player', {start: 14,end: 14}),
            frameRate: 3,
        })

    
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
                if(this.cursors.attack.isDown){
                    meleeAttack()
                }
            }
            
            //player faces reticle
            // this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, reticle.x, reticle.y);
            var attackDirect = Phaser.Math.Angle.Between(this.player.x, this.player.y, reticle.x, reticle.y);
    
            // Makes reticle move with player
            reticle.body.velocity.x = this.player.body.velocity.x;
            reticle.body.velocity.y = this.player.body.velocity.y;
    
            // Constrain position of reticle
            constrainReticle(reticle);
            constrainVelocity(reticle);
    
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

