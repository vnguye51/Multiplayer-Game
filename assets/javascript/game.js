
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
    this.load.image('pointer', 'assets/CharacterSprites/pointer.png')
    this.load.image('player','assets/CharacterSprites/Player_arrow.png')
    this.load.image('enemy','assets/EnemySprites/Enemy.png')
    this.load.image('playerAttack','assets/CharacterSprites/attack-tri.png')
}

function create () //Occurs when the scene is instantiated
{
    _this = this

    //sprites and background
    player = this.physics.add.sprite(160,120,'player');
    enemies = this.physics.add.group()
    reticle = this.physics.add.sprite(180, 120, 'pointer');

        //camera
        this.cameras.main.setSize(400, 300);
        this.cameras.main.startFollow(player);
    

    playerEnemyOverlap = this.physics.add.overlap(enemies,player,hitByEnemy)
    cursors = this.input.keyboard.createCursorKeys() //Assigns the input keys. Default is the directional arrows.
    
    enemy = enemies.create(40,40, 'enemy')

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

    //player faces reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);
    var attackDirect = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Makes reticle move with player
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;

    // Constrain position of reticle
    constrainReticle(reticle);

    constrainVelocity(reticle);

    playerCoordX = player.x;
    playerCoordY = player.y
    
}

function attack(player){ // Called when the player presses spacebar
    console.log('attack!')
    var x = playerCoordX;
    var y = playerCoordY;
    var attack = _this.physics.add.sprite(x, y ,'playerAttack')
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
    var distX = reticle.x-player.x; // X distance between player & reticle
    var distY = reticle.y-player.y; // Y distance between player & reticle

    // Ensures reticle cannot be moved offscreen
    if (distX > 400)
        reticle.x = player.x+400;
    else if (distX < -400)
        reticle.x = player.x-400;

    if (distY > 300)
        reticle.y = player.y+300;
    else if (distY < -300)
        reticle.y = player.y-300;
}