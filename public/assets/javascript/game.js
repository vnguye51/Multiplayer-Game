
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

    //Attach the game engine reference to the player object
    player.ref = this.physics.add.sprite(160,120,'player')
    player.ref.setSize(10,10)//Change hitbox size to be a little smaller than the sprite
    player2.ref = this.physics.add.sprite(120,120,'player')
    player2.ref.setSize(10,10)
    enemies = this.physics.add.group()

    //Attach a collision callback between the group enemies and the player
    playerEnemyOverlap = this.physics.add.overlap(enemies,player.ref,hitByEnemy)

    cursors = this.input.keyboard.createCursorKeys() //Assigns the input keys. Default is the directional arrows.
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
{
    if (cursors.left.isDown){
        player.ref.setVelocityX(-120);

    }
    else if (cursors.right.isDown){
        player.ref.setVelocityX(120);

    }
    else{
        player.ref.setVelocityX(0);
    }
    if (cursors.up.isDown){
        player.ref.setVelocityY(-120);

    }
    else if (cursors.down.isDown){
        player.ref.setVelocityY(120);

    }
    else{
        player.ref.setVelocityY(0);
    }
}

function attack(player){ // Called when the player presses spacebar
    console.log('attack!')
    var attack = _this.physics.add.sprite(80,80,'playerAttack')
    setTimeout(function(){
        attack.destroy()
    },200)
}

function hitByEnemy(player, enemy){
    //Temporarily destroy the on overlap event
    playerEnemyOverlap.destroy()
    console.log('hit!')
    player.setTint(0xff0000)
    setTimeout(function(){
        // After a small amount of time readd the overlap event
        console.log('recovered')
        player.setTint(0xffffff) 
        playerEnemyOverlap = _this.physics.add.overlap(enemies,player,hitByEnemy)
    },1000)
}
