
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


//Initialize global variables
var game = new Phaser.Game(config);
var player
var enemies
var cursors 
var enemy 
var playerEnemyOverlap

var _this //put the game reference in _this for ease of use

function preload () //preload occurs prior to the scene(game) being instantiated
{
    this.load.image('player','assets/CharacterSprites/Player.png')
    this.load.image('enemy','assets/EnemySprites/Enemy.png')
    this.load.image('playerAttack','assets/CharacterSprites/Attack.png')
}

function create () //Occurs when the scene is instantiated
{
    _this = this

    player = this.physics.add.sprite(160,120,'player')
    enemies = this.physics.add.group()

    playerEnemyOverlap = this.physics.add.overlap(enemies,player,hitByEnemy)
    cursors = this.input.keyboard.createCursorKeys() //Assigns the input keys. Default is the directional arrows.
    enemy = enemies.create(40,40, 'enemy')

    this.input.keyboard.on('keydown_SPACE', function(){
        //On space keydown 'attack'
        attack()
    })
}

function update () //Update is called every frame
{
    if (cursors.left.isDown){
        player.setVelocityX(-120);

    }
    else if (cursors.right.isDown){
        player.setVelocityX(120);

    }
    else{
        player.setVelocityX(0);
    }
    if (cursors.up.isDown){
        player.setVelocityY(-120);

    }
    else if (cursors.down.isDown){
        player.setVelocityY(120);

    }
    else{
        player.setVelocityY(0);
    }
}

function attack(player){ // Called when the player 
    console.log('attack!')
    var attack = _this.physics.add.sprite(80,80,'playerAttack')
    setTimeout(function(){
        attack.destroy()
    },200)
}

function hitByEnemy(player, enemy){
    playerEnemyOverlap.destroy()
    console.log('hit!')
    player.setTint(0xff0000)
    setTimeout(function(){
        console.log('recovered')
        player.setTint(0xffffff) 
        playerEnemyOverlap = _this.physics.add.overlap(enemies,player,hitByEnemy)
    },1000)
}
