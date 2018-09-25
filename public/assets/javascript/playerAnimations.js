function definePlayerAnimations(scene){
    ///Player Animations///
    scene.anims.create({
        key: 'up',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'left',
        frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    scene.anims.create({
        key: 'right',
        frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    scene.anims.create({
        key: 'down',
        frames: scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'attackUp',
        frames: scene.anims.generateFrameNumbers('player', {start: 12,end: 12}),
        frameRate: 3,
    })

    scene.anims.create({
        key: 'attackLeft',
        frames: scene.anims.generateFrameNumbers('player', {start: 13,end: 13}),
        frameRate: 3,
    })

    scene.anims.create({
        key: 'attackRight',
        frames: scene.anims.generateFrameNumbers('player', {start: 13,end: 13}),
        frameRate: 3,
    })

    scene.anims.create({
        key: 'attackDown',
        frames: scene.anims.generateFrameNumbers('player', {start: 14,end: 14}),
        frameRate: 3,
    })
}
       