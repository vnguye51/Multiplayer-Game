
///BOILER PLATE CODE
var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 240,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

///Constructors for game characters
var Character = function(control,hp,att){
    this.control = control //When this is false we should deny player input
    this.hp = hp
    this.att = att
}

var Enemy = function(hp,att){
    this.hp = hp
    this.att = att
}
///////////////////////////////

//Initialize global variables

var game = new Phaser.Game(config);
var player
var enemies 
var cursors 
var enemy = new Enemy(3,1)
var map
var groundLayer
var wallLayer
var objectLayer
var playerEnemyOverlap

var _this //put the game reference in _this for ease of use

function preload () //preload occurs prior to the scene(game) being instantiated
{
    //Load player assets
    this.load.image('pointer', 'assets/CharacterSprites/pointer.png')
    this.load.image('player','assets/CharacterSprites/Player_arrow.png')
    this.load.image('playerAttack','assets/CharacterSprites/attack-tri.png')
    
    //Load enemy assets
    this.load.image('enemy','assets/EnemySprites/Enemy.png')

    //Load tilemap assets
    this.load.image('cave', 'assets/tilemap/cave.png')
    this.load.tilemapTiledJSON('map','assets/tilemap/Map1.json')

}

function create () //Occurs when the scene is instantiated
{
    _this = this
     //Assigns the input keys. 
    this.cursors = this.input.keyboard.addKeys({ 
        'up': Phaser.Input.Keyboard.KeyCodes.W, 
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D });
    
    this.otherPlayers = this.physics.add.group()
    this.socket = io()
    this.socket.on('currentPlayers', function(players){
        for(id in players){
            if (players[id].playerId === _this.socket.id) {
                addPlayer(_this, players[id]); //creates _this.player
              }
            else{
                addOtherPlayer(_this, players[id])
              }
        }
    })
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayer(_this, playerInfo);
      });
    this.socket.on('disconnect', function (playerId) {
        _this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
            }
        });
    });
    
    enemies = this.physics.add.group()
    reticle = this.physics.add.sprite(180, 120, 'pointer');

    //camera
    this.cameras.main.setSize(400, 300);


    enemy.ref = enemies.create(80,80, 'enemy')

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
    objectLayer.setCollisionByExclusion([-1,69,85,100,101,102])
    objectLayer.setDepth(-1)


    //Player Inputs go here
    this.input.keyboard.on('keydown_SPACE', function(){
        //On space keydown 'attack'
        attack()
    })

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
}

function update () //Update is called every frame
{   // Only run update code once the player is connected
    if(this.player){
        if(this.player.stats.control == true)
        if (this.cursors.left.isDown){
            this.player.setVelocityX(-120);
    
        }
        else if (this.cursors.right.isDown){
            this.player.setVelocityX(120);
    
        }
        else{
            this.player.setVelocityX(0);
        }
        if (this.cursors.up.isDown){
            this.player.setVelocityY(-120);
    
        }
        else if (this.cursors.down.isDown){
            this.player.setVelocityY(120);
    
        }
        else{
            this.player.setVelocityY(0);
        }

    //player faces reticle
    this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, reticle.x, reticle.y);
    var attackDirect = Phaser.Math.Angle.Between(this.player.x, this.player.y, reticle.x, reticle.y);

    // Makes reticle move with player
    reticle.body.velocity.x = this.player.body.velocity.x;
    reticle.body.velocity.y = this.player.body.velocity.y;

    // Constrain position of reticle
    constrainReticle(reticle);
    constrainVelocity(reticle);

    playerCoordX = this.player.x;
    playerCoordY = this.player.y


    ////Emit Socket Signals////
    // emit player movement
    var x = this.player.x;
    var y = this.player.y;

    //If player position changed
    if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y )) {
    this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y});
    }
    
    // save old position data
    this.player.oldPosition = {
    x: this.player.x,
    y: this.player.y,
    };
    
    this.socket.on('playerMoved', function (playerInfo) {
        _this.otherPlayers.getChildren().forEach(function (otherPlayer) {
        //Might be inefficient code revisit later. Shouldn't have to loop through all the IDs
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setRotation(playerInfo.rotation);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
        });
      });
    }
}

function attack(player){ // Called when the player presses spacebar
    var attack = _this.physics.add.sprite(80,80,'playerAttack')
    setTimeout(function(){
        attack.destroy()
    },200)
}

function hitByEnemy(player, enemy){
    //Temporarily destroy the on overlap event
    playerEnemyOverlap.destroy()
    player.stats.control = false
    player.setTint(0xff0000)
    setTimeout(function(){
        // After a small amount of time readd the overlap event
        player.stats.control = true
        console.log('recovered')
        player.setTint(0xffffff) 
        playerEnemyOverlap = _this.physics.add.overlap(enemies,player,hitByEnemy)
    },1000)
}

function addPlayer(_this, playerInfo){
    _this.player = _this.physics.add.image(playerInfo.x, playerInfo.y, 'player');
    _this.player.setSize(10,10)
    _this.cameras.main.startFollow(_this.player);
    _this.physics.add.collider(wallLayer,_this.player) //Create collision interaction
    _this.physics.add.collider(objectLayer,_this.player)
    _this.player.stats = {
        hp: 5,
        control: true,
    }
    //Attach a collision callback between the group enemies and the player
    console.log(_this.player)

    playerEnemyOverlap = _this.physics.add.overlap(enemies,_this.player,hitByEnemy)
    
}

function addOtherPlayer(_this, playerInfo){
    var otherPlayer = _this.add.sprite(playerInfo.x, playerInfo.y, 'player');
    otherPlayer.setTint(0x00ff00);
    otherPlayer.playerId = playerInfo.playerId;
    _this.otherPlayers.add(otherPlayer);
}

// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite, maxVelocity)
{
    if (!sprite || !sprite.body)
      return;

    var angle, currVelocitySqr, vx, vy;
    vx = sprite.body.velocity.x;
    vy = sprite.body.velocity.y;
    currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity)
    {
        angle = Math.atan2(vy, vx);
        vx = Math.cos(angle) * maxVelocity;
        vy = Math.sin(angle) * maxVelocity;
        sprite.body.velocity.x = vx;
        sprite.body.velocity.y = vy;
    }
}

// Ensures reticle does not move offscreen relative to player
function constrainReticle(reticle)
{
    var distX = reticle.x-_this.player.x; // X distance between _this.player & reticle
    var distY = reticle.y-_this.player.y; // Y distance between _this.player & reticle

    // Ensures reticle cannot be moved offscreen
    if (distX > 400)
        reticle.x = _this.player.x+400;
    else if (distX < -400)
        reticle.x = _this.player.x-400;

    if (distY > 300)
        reticle.y = _this.player.y+300;
    else if (distY < -300)
        reticle.y = _this.player.y-300;
}