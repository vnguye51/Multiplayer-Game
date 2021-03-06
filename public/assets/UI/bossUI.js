class BossUI extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'bossUI' });
    }


    preload(){
        this.load.image('bossHealthTop','assets/UI/bossHealthTop.png')
        this.load.image('bossHealthInner','assets/UI/bossHealthInner.png')
        this.load.image('bossHealthUnder','assets/UI/bossHealthUnder.png')
    }

    create(){
        this.add.sprite(160,216,'bossHealthUnder')
        var bossHealth = this.add.sprite(160,216,'bossHealthInner')
        this.add.sprite(160,216,'bossHealthTop')
        socket.on('updateBossHealth',function(health){
            bossHealth.scaleX = (health/80)
            bossHealth.x = 160 - (80-health)*288/80/2
        })
    }
}