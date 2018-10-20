
const creditsText = ['CREATOR: Vincent Nguyen',
    'SPRITES BY: LUNARSIGNALS(CC-BY-SA 3.0)',
   'TILESETS BY: Beast (CC-BY 3.0)']
class credits extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'credits' });
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
        var creator = this.add.text(160,30, creditsText[0], {fontSize: '12px'})
        creator.setOrigin(0.5,0.5)
        var sprites = this.add.text(160,350, creditsText[1], {fontSize: '12px'})
        sprites.setOrigin(0.5,0.5)
        this.add.sprite(160,60,'lancer')
        
    }

    update(){
        this.cameras.main.scrollY += 0.5
    }
}