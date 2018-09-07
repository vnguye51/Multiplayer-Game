
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
var player = new Character(true,5,10)
var player2 = new Character(true,5,10)
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
    this.load.image('player','assets/CharacterSprites/Player.png')
    this.load.image('enemy','assets/EnemySprites/Enemy.png')
    this.load.image('playerAttack','assets/CharacterSprites/Attack.png')

    this.load.image('cave', 'assets/tilemap/cave.png')
    this.load.tilemapTiledJSON('map','assets/tilemap/Map1.json')

}

function create () //Occurs when the scene is instantiated
{
    _this = this
    this.cursors = this.input.keyboard.createCursorKeys(); //Assigns the input keys. Default is the directional arrows.
    this.otherPlayers = this.physics.add.group()
    this.socket = io()
    this.socket.on('currentPlayers', function(players){
        console.log('connected')
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
    //Attach the game engine reference to the player object
    //Change hitbox size to be a little smaller than the sprite

    enemies = this.physics.add.group()

    //Attach a collision callback between the group enemies and the player
    playerEnemyOverlap = this.physics.add.overlap(enemies,this.player,hitByEnemy)
    
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

    this.physics.add.collider(wallLayer,player.ref) //Create collision interaction

    objectLayer = map.createStaticLayer('Objects',tileset,0,0)
    objectLayer.setCollisionByExclusion([-1,69,85,100,101,102])
    objectLayer.setDepth(-1)
    this.physics.add.collider(objectLayer,player.ref)


    //Player Inputs go here
    this.input.keyboard.on('keydown_SPACE', function(){
        //On space keydown 'attack'
        attack()
    })
}

function update () //Update is called every frame
{   // Only run update code once the player is connected
    if(this.player){
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
    player.setTint(0xff0000)
    setTimeout(function(){
        // After a small amount of time readd the overlap event
        console.log('recovered')
        player.setTint(0xffffff) 
        playerEnemyOverlap = _this.physics.add.overlap(enemies,player,hitByEnemy)
    },1000)
}

function addPlayer(_this, playerInfo){
    _this.player = _this.physics.add.image(playerInfo.x, playerInfo.y, 'player');
    _this.player.setSize(10,10)
}

function addOtherPlayer(_this, playerInfo){
    var otherPlayer = _this.add.sprite(playerInfo.x, playerInfo.y, 'player');
    otherPlayer.setTint(0x00ff00);
    otherPlayer.playerId = playerInfo.playerId;
    _this.otherPlayers.add(otherPlayer);
}