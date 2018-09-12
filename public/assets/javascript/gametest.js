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
    scene: [floor1,floor2]
};



// var socket = io()
var game = new Phaser.Game(config);
sockets()
//Define global variables(might want to move them into the classes later)

var enemies 
var map
var groundLayer
var wallLayer
var objectLayer
var playerEnemyOverlap
var attackCollider
var reticle

var _this //put the game reference in _this for ease of use
