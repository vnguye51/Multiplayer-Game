
function changeScene(scene) {
    _this.socket.disconnect();
    _this.player = null;
    _this.scene.start(scene);
}



function meleeAttack(){
    var dir = _this.player.direction
    _this.player.stats.control = false
    _this.player.setVelocityX(0)
    _this.player.setVelocityY(0)
    if(dir == 'left'){
        _this.player.anims.play('attackLeft',true)
        var attack = _this.physics.add.sprite(_this.player.x-16,_this.player.y,'playerMeleeAttack')
        attack.rotation = Math.PI
    }
    else if(dir == 'right'){
        _this.player.anims.play('attackRight',true)
        var attack = _this.physics.add.sprite(_this.player.x+16,_this.player.y,'playerMeleeAttack')
        attack.rotation = 0
    }
    else if(dir == 'down'){
        _this.player.anims.play('attackDown',true)
        var attack = _this.physics.add.sprite(_this.player.x,_this.player.y+16,'playerMeleeAttack')
        attack.rotation = Math.PI/2
    }
    else{
        _this.player.anims.play('attackUp',true)
        var attack = _this.physics.add.sprite(_this.player.x,_this.player.y-16,'playerMeleeAttack')
        attack.rotation = 3*Math.PI/2
    }
    var attackCollider = _this.physics.add.overlap(attack,enemyAttackGroup,function(attack,enemy){
        enemyHit(dir,attack,enemy,attackCollider)
    })
     //At some point this collider should be moved to the global scope and never destroyed
    setTimeout(function(){
        if(attackCollider.world){
            attackCollider.destroy()
        }
        _this.player.stats.control = true
        attack.destroy()
        if(dir == 'left'){
            _this.player.anims.play('left',true)
        }
        else if(dir == 'right'){
            _this.player.anims.play('right',true)
        }
        else if(dir == 'down'){
            _this.player.anims.play('down',true)
        }
        else{
            _this.player.anims.play('up')
        }
    },200)
}

function updateHealthBar(player){
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

function enemyHit(dir,attack,enemy,collider){
    if(collider.world){
        ///need to change this to only destroy the collision between the enemy 
        enemyAttackGroup.remove(enemy)
        _this.socket.emit('enemyHit',enemy.id,dir)
        enemy.setTint(0x00ffff)
        setTimeout(function(){
            enemy.setTint(0xffffff)
            enemyAttackGroup.add(enemy)
        },500)
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
            player.setTint(0xff0000)
            setTimeout(function(){
                // After a small amount of time player regains control
                player.stats.control = true
            },100)
        
    
            setTimeout(function(){
                // After a little more time readd the overlap event 
                //Return player to original color
                player.setTint(0xffffff) 
                // Readd the overlap event
                playerEnemyOverlap = _this.physics.add.overlap(enemies,player,hitByEnemy)
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
    _this.physics.add.sprite(player.x,player.y,'tombstone')
    _this.player.visible = false
    _this.socket.emit('playerDeath',_this.socket.id)
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
    
}

function addOtherPlayer(_this, playerInfo){
    var otherPlayer = _this.add.sprite(playerInfo.x, playerInfo.y, 'player');
    otherPlayer.rot = playerInfo.rot
    otherPlayer.setTint(0x00ff00);
    otherPlayer.playerId = playerInfo.playerId;
    _this.otherPlayers.add(otherPlayer);
}

function addEnemy(_this, enemyInfo){
    enemy = new Tier1Melee(_this,enemyInfo.x,enemyInfo.y,enemyInfo.health,enemyInfo.id)
    enemies.add(enemy,true)
    enemyAttackGroup.add(enemy)
    enemy.create()
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
    _this.socket = io()
    //currentPlayers is sent when you connect to the server
    //Grabs the list of players including yourself from the server and adds them to the client
    _this.socket.on('currentPlayers', function (players) {
        var ids = Object.keys(players)
        for(var i = 0; i< ids.length; i++){
            if (players[ids[i]].playerId === _this.socket.id) {
                addPlayer(_this, players[ids[i]]); //creates _this.player
              }
            else{
                addOtherPlayer(_this, players[ids[i]])
              }
        }
    });

    _this.socket.on('currentScene',function(scene){
        changeScene(scene)
    })

    //newPlayer is sent when a new player connects to the server
    //Adds that player to the game
    _this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayer(_this, playerInfo);
    });

    //currentEnemies is sent when you connect to the server
    //Grabs the list of current enemies and adds them to the client
    _this.socket.on('currentEnemies', function (enemies) {
        var ids = Object.keys(enemies)

        for (var i = 0; i<ids.length; i++) {
            addEnemy(_this, enemies[ids[i]]);
        }
    });

    //updateEnemies is sent every frame(30fps)
    //Updates the position and logic of every enemy in the game
    _this.socket.on('updateEnemies', function (enemies) {
        for (id in enemies) {
            
            updateEnemy(_this, enemies[id]);
        }
    });

    //enemyDeath is sent whenever an enemy dies
    //Removes the enemy from your game
    _this.socket.on('enemyDeath', function (enemyID) {
        removeEnemy(_this, enemyID);
    });

    //disconnect is sent whenever another player's connection is lost
    //Removes that player from the game
    _this.socket.on('disconnect', function (playerId) {
        _this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

    //Whenever a player moves or changes rotation on the server update it in the client
    _this.socket.on('playerMoved', function (playerInfo) {
        _this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            //Might be inefficient code revisit later. Shouldn't have to loop through all the IDs
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    _this.socket.on('playerDeath', function(playerId){
        _this.otherPlayers.getChildren().forEach(function(otherPlayer){
            if(otherPlayer.playerId == playerId){
            _this.physics.add.sprite(otherPlayer.x,otherPlayer.y,'tombstone')
            _this.otherPlayer.visible = false
            }
        })
    })
}