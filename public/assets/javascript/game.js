var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 240,
    pixelArt: true,
    zoom: 2,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    parent: 'game',
    scene: [credits,lobby,floor1,floor2,floor3,floor4,ui,BossUI]
};



var game = new Phaser.Game(config);
//Define global variables(might want to move them into the classes later)

var enemies 
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
