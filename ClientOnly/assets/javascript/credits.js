
const creditsText = ['VICTORY',
    'CREATOR: Vincent Nguyen',
    'SPRITES BY: LUNARSIGNALS(CC-BY-SA 3.0)',
   'TILESETS BY: Beast (CC-BY 3.0)',
    'Thanks for playing!']
class credits extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'credits' });
        this.timer = 300
    }
    preload(){
        //Load player assets
        this.load.image('tombstone','assets/items/tombstone.png')
        this.load.spritesheet('player','assets/CharacterSprites/notlink.png',{frameWidth: 16,frameHeight:16})
        this.load.image('playerMeleeAttack', 'assets/items/woodSword.png')
        
        //Load enemy assets
        this.load.spritesheet('lancer','assets/enemies/sprites/lancer/lancer.png',{frameWidth: 16,frameHeight:16})
        this.load.spritesheet('bat','assets/enemies/sprites/bat/bat.png',{frameWidth:16,frameHeight:16})
        this.load.spritesheet('whelp','assets/enemies/sprites/whelp/Whelp.png',{frameWidth:64,frameHeight:64})
        this.load.image('fireball', 'assets/projectiles/fireball.png')
        //Load tilemap assets
        this.load.image('cave', 'assets/tilemap/cave.png')
        this.load.tilemapTiledJSON('map','assets/tilemap/Map1.json')
    }

    create(){
        // this.cameras.main.followOffset.y = 300
        this.add.text(160,120, creditsText[0], {fontSize: '32px'}).setOrigin(0.5,0.5)
        this.add.text(160,360, creditsText[1], {fontSize: '12px'}).setOrigin(0.5,0.5)
        this.add.text(160,600, creditsText[2], {fontSize: '12px'}).setOrigin(0.5,0.5)
        this.add.text(160,840, creditsText[3], {fontSize: '12px'}).setOrigin(0.5,0.5)
        this.add.text(160,1200, creditsText[4], {fontSize: '24px'}).setOrigin(0.5,0.5)
        var lancer = this.add.sprite(160,630)
        var bat = this.add.sprite(160,660)
        var whelp = this.add.sprite(160,710)
        var linkle = this.add.sprite(160,770)
        var tiles = this.add.sprite(160,860,'cave').setOrigin(0.5,0)
        tiles.scaleX = 0.5
        tiles.scaleY = 0.5
        this.anims.create({
            key: 'lancerRight',
            frames: this.anims.generateFrameNumbers('lancer', { start: 4, end: 7 }),
            frameRate: 5,
            repeat: -1
        })
        this.anims.create({
            key: 'bat',
            frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'whelp',
            frames: this.anims.generateFrameNumbers('whelp', {start:0,end: 5}),
            frameRate: 4,
            repeat: -1
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        lancer.anims.play('lancerRight')
        bat.anims.play('bat')
        whelp.anims.play('whelp')
        linkle.anims.play('right')
    }

    update(){
        if(this.timer>0){
            this.timer -= 1
        }
        else if(this.timer != -1){
            this.cameras.main.scrollY += 1
            if(this.cameras.main.scrollY == 240 || this.cameras.main.scrollY == 570 || this.cameras.main.scrollY == 810){
                this.timer = 240
            }
            if(this.cameras.main.scrollY == 1080){
                this.timer = -1
            }
        }
    }
}