# Multiplayer-Game
#Real-time Multiplayer Socket Game

#Description
* This game is a persistent "MMO" world. Any number of players can work together to traverse the dungeon and defeat the boss. Progress is shared between all players. No enemies respawn so even if a player falls he is sure to have created progress for others. If a floor is completed all new players that join will also start on the next floor. The world does not reset until the boss is defeated.

* For now, this is a proof of concept. 

#Technologies
* Server-side collision with static objects is determined by querying an object-map that stores tile-types
* The game is rendered using Phaser3 
* Deaths and player records are stored in a MongoDB database
* Real-time communication between server and clients is powered by Socket.IO

#Instructions to Run
* The game should run out of the box. Simply add the necessary modules using npm install.
