
function changeScene(scene) {
    if(_this.player.health<= 0){
        reset()
    }
    else{
        socket.disconnect();
        _this.player = null;
        _this.scene.start(scene);
    }
}


function meleeAttack(){
    var dir = _this.player.direction
    _this.player.stats.control = false
    _this.player.setVelocityX(0)
    _this.player.setVelocityY(0)
    if(dir == 'left'){
        _this.player.anims.play('attackLeft',true)
        _this.player.currentAnim = 'attackLeft'
        var attack = _this.physics.add.sprite(_this.player.x-20,_this.player.y,'playerMeleeAttack')
        attack.rotation = Math.PI
    }
    else if(dir == 'right'){
        _this.player.anims.play('attackRight',true)
        _this.player.currentAnim = 'attackRight'
        var attack = _this.physics.add.sprite(_this.player.x+20,_this.player.y,'playerMeleeAttack')
        attack.rotation = 0
    }
    else if(dir == 'down'){
        _this.player.anims.play('attackDown',true)
        _this.player.currentAnim = 'attackDown'
        var attack = _this.physics.add.sprite(_this.player.x,_this.player.y+20,'playerMeleeAttack')
        attack.rotation = Math.PI/2
    }
    else{
        _this.player.anims.play('attackUp',true)
        _this.player.currentAnim = 'attackUp'
        var attack = _this.physics.add.sprite(_this.player.x,_this.player.y-20,'playerMeleeAttack')
        attack.rotation = 3*Math.PI/2
    }
    var attackCollider = _this.physics.add.overlap(attack,enemyAttackGroup,function(attack,enemy){
        enemyHit(dir,attack,enemy,attackCollider)
    })
    setTimeout(function(){
        if(attackCollider.world){
            attackCollider.destroy()
        }
        if(_this.player.health >0){
            _this.player.stats.control = true
        }
        attack.destroy()
        if(dir == 'left'){
            _this.player.anims.play('left',true)
            _this.player.currentAnim = 'left'
        }
        else if(dir == 'right'){
            _this.player.anims.play('right',true)
            _this.player.currentAnim = 'right'

        }
        else if(dir == 'down'){
            _this.player.anims.play('down',true)
            _this.player.currentAnim = 'down'

        }
        else{
            _this.player.anims.play('up')
            _this.player.currentAnim = 'up'
        }
    },200)
}

function updateHealthBar(player){
    if(healthbar){
        if(player.health >= 0){
            
            healthbar.clear()
            var frameArray = []
            for(var i = 0; i < player.health; i++){
                frameArray.push(0)
            }
            for (var i = 0 ; i < 5-player.health; i++){
                frameArray.push(1)
            }
            healthbar.createMultiple({key:'healthbar',frame: frameArray})
            Phaser.Actions.SetXY(healthbar.getChildren(),12,12,20)
            healthbar.getChildren().forEach(function(child){
                child.scaleX = 0.5
                child.scaleY = 0.5
            })
        }
    }
}

function enemyHit(dir,attack,enemy,collider){
    if(collider.world){
        ///need to change this to only destroy the collision between the enemy 
        enemyAttackGroup.remove(enemy)
        socket.emit('enemyHit',enemy.id,dir)
        enemy.setTintFill(0xffffff)
        setTimeout(function(){
            enemy.clearTint()
        },100)
        setTimeout(function(){
            enemyAttackGroup.add(enemy)
        },300)
    }
}


function hitByEnemy(player, enemy){
    //Check if the overlap still exists
    if(playerEnemyOverlap.world){
        player.health -= 1
        updateHealthBar(player)

        //Temporarily destroy the on overlap event(player is invulnerable)
        playerEnemyOverlap.destroy()
        //Remove player control
    
        player.stats.control = false

        
        if(player.health > 0){
            //Calculate angle between the the collision
            var theta = Phaser.Math.Angle.Between(player.x,player.y,enemy.x,enemy.y);
            //Move the player away from the collision (theta+180degrees)
            player.body.velocity.x = (Math.cos(theta+Math.PI)*360)
            player.body.velocity.y = (Math.sin(theta+Math.PI)*360)
        
            //Color the player a little to show damage
            player.setTintFill(0xffffff)
            setTimeout(function(){
                if(player.health <= 0){
                    playerDeath(player)
                }
                else{
                    player.stats.control = true
                }
            },100)
        
    
            setTimeout(function(){
                // After a little more time readd the overlap event 
                //Return player to original color
                player.clearTint()
                // Readd the overlap event
                playerEnemyOverlap = _this.physics.add.overlap(enemies,player,hitByEnemy)
            },400)
        }
        else{
            playerDeath(player)
        }
    }
   
}

function hitByProjectile(player, projectile){
    //Check if the overlap still exists
    if(playerProjectileOverlap.world){
        player.health -= 1
        updateHealthBar(player)

        //Temporarily destroy the on overlap event(player is invulnerable)
        playerProjectileOverlap.destroy()
        //Remove player control
    
        player.stats.control = false

        
        if(player.health > 0){
            //Calculate angle between the the collision
            var theta = Phaser.Math.Angle.Between(player.x,player.y,projectile.x,projectile.y);
            //Move the player away from the collision (theta+180degrees)
            player.body.velocity.x = (Math.cos(theta+Math.PI)*360)
            player.body.velocity.y = (Math.sin(theta+Math.PI)*360)
        
            //Color the player a little to show damage
            player.setTint(0xff0000)
            setTimeout(function(){
                // After a small amount of time player regains control
                if(player.health <= 0){
                    playerDeath(player)
                }
                else{
                    player.stats.control = true
                }
            },100)
        
    
            setTimeout(function(){
                // After a little more time readd the overlap event 
                //Return player to original color
                player.setTint(0xffffff) 
                // Readd the overlap event
                playerProjectileOverlap = _this.physics.add.overlap(enemyProjectiles,player,hitByProjectile)
            },300)
        }
        else{
            playerDeath(player)
        }
    }
}

function playerDeath(player){
    player.setVelocityX(0)
    player.setVelocityY(0)
    _this.nametag.destroy()
    _this.physics.add.sprite(player.x,player.y,'tombstone')
    _this.player.visible = false
    socket.emit('playerDeath',socket.id)
    uiScene.deathText.setVisible(true)
    uiScene.resetButton.setVisible(true)

}


function reset(){
    uiScene.resetButton.setVisible(false)
    uiScene.deathText.setVisible(false)
    socket.disconnect()
    _this.scene.restart()

    //Reset the player values
}

function addPlayer(_this, playerInfo){
    _this.player = _this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player');
    _this.player.direction = 'left'
    _this.player.health = 5
    _this.player.setSize(10,10)
    _this.cameras.main.startFollow(_this.player);
    _this.physics.add.collider(wallLayer,_this.player) //Create collision interaction
    _this.physics.add.collider(objectLayer,_this.player)
    _this.player.stats = {
        hp: 5,
        control: true,
    }
    //Attach a collision callback between the group enemies and the player

    playerEnemyOverlap = _this.physics.add.overlap(enemies,_this.player,hitByEnemy)
    playerProjectileOverlap = _this.physics.add.overlap(enemyProjectiles,_this.player,hitByProjectile)
}

function addOtherPlayer(_this, playerInfo){
    var otherPlayer = _this.add.sprite(playerInfo.x, playerInfo.y, 'player');
    otherPlayer.nametag = _this.add.text(playerInfo.x,playerInfo.y+20,playerInfo.name,{fontSize: '10px'}).setOrigin(0.5,0.5)
    otherPlayer.rot = playerInfo.rot
    otherPlayer.setTint(0x00ff00);
    otherPlayer.playerId = playerInfo.playerId;
    _this.otherPlayers.add(otherPlayer);
}

function addEnemy(_this, enemyInfo){
    enemy = new Tier1Melee(_this,enemyInfo.x,enemyInfo.y,enemyInfo.health,enemyInfo.id)
    enemies.add(enemy,true)
    enemyAttackGroup.add(enemy)
}

function updateEnemy(_this,enemyInfo){
    enemies.getChildren().forEach(function(enemy){
        if(enemyInfo && enemy.id == enemyInfo.id){
            enemy.x = enemyInfo.x
            enemy.y = enemyInfo.y
            if(enemy.animation == 'idle'){
                enemy.anims.stop()
            }
            else{
                enemy.anims.play(enemyInfo.animation,true)
            }
        }
    })
}

function removeEnemy(_this,enemyID){
    //Should find a way to immediately remove the enemy by its ID instead of looping through the group
    enemies.getChildren().forEach(function(enemy){
        if(enemy.id == enemyID){
            enemies.remove(enemy,true)
        }
    })
}

function addProjectile(_this,projectileInfo){
    if(projectileInfo){
        projectile = new Fireball(_this,projectileInfo.x,projectileInfo.y,projectileInfo.id)
        enemyProjectiles.add(projectile,true)
    }

}

function updateProjectile(_this,projectileInfo){
    enemyProjectiles.getChildren().forEach(function(projectile){
        if(projectileInfo && projectileInfo.id == projectile.id){
            projectile.x = projectileInfo.x
            projectile.y = projectileInfo.y
        }
    })
}

function removeProjectile(_this,projectileID){
    enemyProjectiles.getChildren().forEach(function(projectile){
        if(projectile.id == projectileID){
            enemyProjectiles.remove(projectile,true)
        }
    })
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
    var distX = reticle.x-_this.player.x; // X distance between _this.player & reticle
    var distY = reticle.y-_this.player.y; // Y distance between _this.player & reticle

    // Ensures reticle cannot be moved offscreen
    if (distX > 400)
        reticle.x = _this.player.x+400;
    else if (distX < -400)
        reticle.x = _this.player.x-400;

    if (distY > 300)
        reticle.y = _this.player.y+300;
    else if (distY < -300)
        reticle.y = _this.player.y-300;
}

function sockets() {
    //Attach socket to the game for ease of access
    // socket = io('https://52.53.200.224:443')
    // socket = io('https://journeyabyss.com')
    socket = io()
    socket.emit('name', playerName)
    //currentPlayers is sent when you connect to the server
    //Grabs the list of players including yourself from the server and adds them to the client
    socket.on('currentPlayers', function (players) {
        var ids = Object.keys(players)
        for(var i = 0; i< ids.length; i++){
            if (players[ids[i]].playerId === socket.id) {
                addPlayer(_this, players[ids[i]]); //creates _this.player
              }
            else if (players[ids[i]].alive){
                addOtherPlayer(_this, players[ids[i]])
              }
        }
    });

    socket.on('currentTombstones',function(tombstones){
        for(var i = 0; i<tombstones.length; i++){
            _this.add.sprite(tombstones[i].x,tombstones[i].y,'tombstone').setDepth(-1)


        }
    })
    socket.on('changeScene',function(scene){
        changeScene(scene)
    })

    //newPlayer is sent when a new player connects to the server
    //Adds that player to the game
    socket.on('newPlayer', function (playerInfo) {
        addOtherPlayer(_this, playerInfo);
    });

    //currentEnemies is sent when you connect to the server
    //Grabs the list of current enemies and adds them to the client
    socket.on('currentEnemies', function (enemies) {
        var ids = Object.keys(enemies)

        for (var i = 0; i<ids.length; i++) {
            if(enemies[ids[i]]){
                addEnemy(_this, enemies[ids[i]]);
            }
        }
    });


    //updateEnemies is sent every frame(30fps)
    //Updates the position and logic of every enemy in the game
    socket.on('updateEnemies', function (enemies) {
        for (id in enemies) {
            updateEnemy(_this, enemies[id]);
        }
    });

    //enemyDeath is sent whenever an enemy dies
    //Removes the enemy from your game
    socket.on('enemyDeath', function (enemyID) {
        removeEnemy(_this, enemyID);
    });

    socket.on('currentProjectiles', function (projectiles){
        for (id in projectiles) {
            if(projectiles[id]){
                addProjectile(_this, projectiles[id]);
            }
        }
    })

    socket.on('updateProjectiles', function (projectiles) {
        //Dangerous nested for loop probably needs to be removed at some point for now it is serviceable
        //A fix would be to not use getChildren()
        for (id in projectiles) {
            var projectileExists = false
            enemyProjectiles.getChildren().forEach(function(projectile){
                if(projectile.id == id){
                    projectileExists = true
                }
            })
            if(!projectileExists){
                addProjectile(_this,projectiles[id])
            }
            updateProjectile(_this, projectiles[id]);
        }
    });

    socket.on('projectileDeath', function(projectileID){
        removeProjectile(_this,projectileID)
    })
    //disconnect is sent whenever another player's connection is lost
    //Removes that player from the game
    socket.on('disconnect', function (playerId) {
        _this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
                otherPlayer.nametag.destroy();
            }
        });
    });

    //Whenever a player moves update it in the client
    socket.on('playerMoved', function (playerInfo) {
        _this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            //Might be inefficient code revisit later. Shouldn't have to loop through all the IDs
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y)
                // console.log(otherPlayer.nametag)
                otherPlayer.nametag.x = playerInfo.x
                otherPlayer.nametag.y = playerInfo.y+20

                if(playerInfo.currentAnim){
                    otherPlayer.anims.play(playerInfo.currentAnim,true)
                    if(playerInfo.currentAnim == 'left'){
                        otherPlayer.flipX = true
                    }
                    else if(playerInfo.currentAnim == 'right'){
                        otherPlayer.flipX = false
                    }
                    
                    if(playerInfo.currentAnim == 'attackLeft'){
                        otherPlayer.anims.play('attackLeft',true)
                        otherPlayer.currentAnim = 'attackLeft'
                        var attack = _this.physics.add.sprite(otherPlayer.x-20,otherPlayer.y,'playerMeleeAttack')
                        attack.rotation = Math.PI
                        setTimeout(function(){
                            attack.destroy()
                        },100)
                    }
                    else if(playerInfo.currentAnim == 'attackRight'){
                        otherPlayer.anims.play('attackRight',true)
                        otherPlayer.AnimAnim = 'attackRight'
                        var attack = _this.physics.add.sprite(otherPlayer.x+20,otherPlayer.y,'playerMeleeAttack')
                        attack.rotation = 0
                        setTimeout(function(){
                            attack.destroy()
                        },100)
                    }
                    else if(playerInfo.currentAnim == 'attackDown'){
                        otherPlayer.anims.play('attackDown',true)
                        otherPlayer.currentAnim = 'attackDown'
                        var attack = _this.physics.add.sprite(otherPlayer.x,otherPlayer.y+20,'playerMeleeAttack')
                        attack.rotation = Math.PI/2
                        setTimeout(function(){
                            attack.destroy()
                        },100)
                    }
                    else if (playerInfo.currentAnim == 'attackUp'){
                        otherPlayer.anims.play('attackUp',true)
                        otherPlayer.currentAnim = 'attackUp'
                        var attack = _this.physics.add.sprite(otherPlayer.x,otherPlayer.y-20,'playerMeleeAttack')
                        attack.rotation = 3*Math.PI/2
                        setTimeout(function(){
                            attack.destroy()
                        },100)
                    }
                }
                else{
                    otherPlayer.anims.stop()
                }
                
            }
        });
    });

    socket.on('playerDeath', function(playerId){
        _this.otherPlayers.getChildren().forEach(function(otherPlayer){
            if(otherPlayer.playerId == playerId){
            _this.physics.add.sprite(otherPlayer.x,otherPlayer.y,'tombstone').setDepth(-1)
            otherPlayer.visible = false
            otherPlayer.nametag.destroy()
            }
        })
    })

    socket.on('Victory', function(){
        var victoryText = uiScene.add.text(160,120,'VICTORY',{fontSize:'32px'}).setOrigin(0.5,0.5)
            setTimeout(function(){
            socket.disconnect();
            _this.player = null;
            uiScene.scene.remove()
            _this.scene.get('bossUI').scene.remove()
            _this.scene.start('credits');
            
        },5000)
    })
}

