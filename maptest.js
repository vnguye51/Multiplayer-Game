// Dependencies
var express = require("express");
// Create an instance of the express app.
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var collisionMap = require('./public/assets/tilemap/Map1.json')
// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 4040;


// for(var i=0; i<3; i++){
//     enemyList[i] = new enemies.Tier1Melee(100+100*i,400,3,i)
// }

app.use(express.static(__dirname + '/public'));
//Allow static files in the public folder to be retrieved from server


// Start our server so that it can begin listening to client requests.
server.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});

///INCOMPLETE 
///PORTING THE JSON COLLISION INFO TO THE SERVER///
function queryCollisions(width,height,xpos,ypos,xvel,yvel,map){
    //Horizontal Collision
    if (place_meeting(xpos+xvel,ypos,width,height,map)){	
        while(!place_meeting(xpos+xvel,ypos,width,height,map)){
            xpos += Math.sign(xvel);
        }
        xvel = 0
    }
    xpos += xvel;
    //Vertical Collision
    if (place_meeting(xpos+xvel,ypos,width,height,map)){	
        while(!place_meeting(xpos+xvel,ypos,width,height,map)){
            xpos += Math.sign(xvel);
        }
        xvel = 0
    }
    ypos += yvel
    return [xpos,ypos]
} 



function place_meeting(x,y, width, height,map){
    //Algorithm:
    //Define a rectangle using startpos(x,y) and width and height
    //A rectangle is defined by four points (x0,y0),(x0,y1),(x1,y0),(x1,y1)
    //Do a nested for loop through starting at (x0,y0) up to (x1,y1) with steps of the tilemap width/height
    //If any tiles are found(nonzero) then return true
    //If the loop completes return  false


    //Define the rectangle
    var x0 = x-Math.floor(width/2);
    var y0 = y-Math.floor(height/2);
    var x1 = x + Math.floor(width/2);
    var y1 = y + Math.floor(height/2);
    xcorners = [x0,x1]
    ycorners = [y0,y1]

    function queryTile(x,y,map){
        var tiledX = Math.floor(x/map.tilewidth);
        var tiledY = Math.floor(y/map.tileheight);
        tilePos = tiledX + tiledY * (map.width)
        return map.layers[2].data[tilePos] 
    }

    // Check corners
    for(var i = 0; i < xcorners.length; i++){
        for(var j = 0; j < ycorners.length; j++){
            var tile = queryTile(xcorners[i],ycorners[j],map)
            if(tile != null && tile != 0){
                return tile
            }
        }
    }

    // Check positions inside the object
    for(var x = x0; x<x1; x+=map.tilewidth){
        for (var y = y0; y<y1; y+=map.tileheight){
            var tile = queryTile(x,y,map)
            if(tile != null && tile != 0){
                return tile
            }
        }
    }

    return false
}


console.log(place_meeting(1621,0,12,12,collisionMap))


