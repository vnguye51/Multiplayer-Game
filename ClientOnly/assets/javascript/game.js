var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 240,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [start,credits,lobby,floor1,floor2,floor3,floor4,ui,BossUI]
};



var game = new Phaser.Game(config);
//Define global variables(might want to move them into the classes later)

var enemies 
var playerName = ''

var socket 
var enemyAttackGroup
var enemyProjectiles
var map
var groundLayer
var wallLayer
var objectLayer
var playerEnemyOverlap
var playerProjectileOverlap
var attackCollider
var spaceIsPressed = false
var healthbar
var bossHealthBar 
var uiScene
var _this //put the game reference in _this for ease of use


function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var scale = Math.min(w / config.width, h / config.height);
    
    game.canvas.setAttribute('style',
        ' -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1);' +
        ' -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');' +
        ' transform-origin: top left;   image-rendering: -moz-crisp-edges;image-rendering: -webkit-crisp-edges;' + 
        ' image-rendering: pixelated;image-rendering: crisp-edges;'
    );
    
    width = w / scale;
    height = h / scale;
    game.resize(width, height);
    game.scene.scenes.forEach(function (scene) {
        scene.cameras.main.setViewport(0, 0, width, height);
    });
}

window.addEventListener('resize', resize);
if(game.isBooted) resize();
else game.events.once('boot', resize);

resize()
                

