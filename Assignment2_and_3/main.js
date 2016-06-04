function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0, 0, 800, 800);
    Entity.prototype.draw.call(this);
}

function Unicorn(game, x, y, typeID) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/firen_0.png"), 0, 0, 80, 86, 0.15, 3, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/firen_1.png"), 0, 165, 80, 80, 0.15, 5, false, false);

    this.animationWalk = new Animation(ASSET_MANAGER.getAsset("./img/firen_0.png"), 160, 0, 80, 86, 0.15, 5, true, false);

    this.animationWalkBack = new Animation(ASSET_MANAGER.getAsset("./img/firen_0_reflect.png"), 160, 0, 80, 86, 0.15, 5, true, true);


    this.walking = false;
    this.jumping = false;

    this.radius = 100;
    this.ground = 435;
    this.pid = typeID;
    //-------------------------------------------------------------------
    this.fireBallCountDown = 0;
    this.fireBallNumber;
    Entity.call(this, game, x, y, typeID);
}

Unicorn.prototype = new Entity();
Unicorn.prototype.constructor = Unicorn;

Unicorn.prototype.update = function () {
    if (this.game.space) {
        if (!this.jumping) {
            this.jumping = true;
            this.ground = this.y;
        }
    }
    //------------------- add fire ball------------------------------------
    if (this.fireBallCountDown === 100) {

        var testing = new fireBall(this.game, this.x , this.y, 3, 1);
        this.game.addEntity(testing);
        this.fireBallCountDown = 0;
        this.fireBallNumber++;
    } else {
        this.fireBallCountDown++;
    }
    //----------------------------------------------------------
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = totalHeight * (-3 * (jumpDistance * jumpDistance - jumpDistance));

        this.y = this.ground - height
        this.x = this.x + 1;
    }
    if (this.game.Wup) {
        if (this.y > 0)
            this.y = this.y - 7;
    }

    if (this.game.Sdown) {
        if (this.y < 810 - 100)
            this.y = this.y + 7;
    }

    if (this.game.Aleft) {
        console.log(this.x);
        if (this.x > 0)
            this.x = this.x - 7;
    }
    if (this.game.Dright) {
        console.log(this.x);
        if (this.x < 800 - 80)
            this.x = this.x + 7;
    }
    Entity.prototype.update.call(this);
}

Unicorn.prototype.draw = function (ctx) {
    if (this.jumping) {  
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else if (this.game.Dright || this.game.Wup || this.game.Sdown ) {
        this.animationWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if (this.game.Aleft) {
        this.animationWalkBack.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/firen_0.png");
ASSET_MANAGER.queueDownload("./img/firen_0_reflect.png");
ASSET_MANAGER.queueDownload("./img/firen_1.png");
ASSET_MANAGER.queueDownload("./img/firen_2.png");

//----------------------------------------- add fire ball picture --------------------
ASSET_MANAGER.queueDownload("./img/firen_ball.png");
ASSET_MANAGER.queueDownload("./img/firen_ball_reflect.png");
ASSET_MANAGER.queueDownload("./img/firen_1_reflect.png");
//--------------------------------------------------------------------------


ASSET_MANAGER.downloadAll(function () {

    var socket = io.connect("http://76.28.150.193:8888");
    
    
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    
    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var unicorn = new Unicorn(gameEngine, 0, 435, 1);
    var fireGuyAnnimation = new fireguy(gameEngine, 700, 435, 2);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(unicorn);
    gameEngine.addEntity(fireGuyAnnimation);
    gameEngine.init(ctx);
    gameEngine.start();

    
    //------------- Save button-------------------------------
    var saveButton = document.createElement("Button");
    saveButton.innerHTML = "Save";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(saveButton);

    saveButton.addEventListener("click", function () {
        var entitiesList = [];
        for (var i = 0; i < gameEngine.entities.length; i++) {
            if (gameEngine.entities[i].typeID === 1 ||
                gameEngine.entities[i].typeID === 2 ) {
                let temp = new entityInfo(gameEngine.entities[i].typeID,
                    gameEngine.entities[i].x, gameEngine.entities[i].y,
                    null);
                entitiesList.push(temp);
                console.log("Type ID : " + gameEngine.entities[i].typeID);
            }

            if ( gameEngine.entities[i].typeID === 3 ||
                gameEngine.entities[i].typeID === 4) {
                let temp = new entityInfo(gameEngine.entities[i].typeID,
                    gameEngine.entities[i].x, gameEngine.entities[i].y,
                    gameEngine.entities[i].direction);
                entitiesList.push(temp);
                console.log("Type ID : " + gameEngine.entities[i].typeID + ", direction : "
                    + gameEngine.entities[i].direction);
            }
        }
        console.log("I am in the save");
        console.log("Save data length " + entitiesList.length);
        socket.emit("save", { studentname: "Sawet", statename: "abc", data: entitiesList });
    });


    //------------- load button ----------------------------
    var loadButton = document.createElement("Button");
    loadButton.innerHTML = "Load";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(loadButton);

    loadButton.addEventListener("click", function () {
        socket.emit("load", { studentname: "Sawet", statename: "abc" });        
    });

    

    socket.on("load", function (data) {
        console.log(data);

        gameEngine.entities = [];
        gameEngine.addEntity(new Background(gameEngine));

        var newUnicorn;
        var newFireGuy;
        var newskullHead;
        var newExplosion;
        var theData = data.data;

        //let newData = [];
        for (var i = 0; i < theData.length; i++) {
            switch (theData[i].typeID) {
                case 1:
                    newUnicorn = new Unicorn(gameEngine, theData[i].x,
                        theData[i].y, theData[i].typeID);
                    console.log("Create Monster : " + newUnicorn.pid);
                    gameEngine.addEntity(newUnicorn);
                    break;
                case 2:
                    newFireGuy = new fireguy(gameEngine, theData[i].x,
                        theData[i].y, theData[i].typeID);
                    console.log("Create Monster : " + newUnicorn.pid + " The direction is : ");
                    gameEngine.addEntity(newFireGuy);
                    break;

                case 3:
                    newskullHead = new fireBall(gameEngine, theData[i].x,
                        theData[i].y, theData[i].typeID, theData[i].direction);
                    console.log("Create Monster : " + newskullHead.pid + " The direction is : " + newskullHead.direction);
                    gameEngine.addEntity(newskullHead);
                    break;
                case 4:
                    newExplosion = new skullHeadExplosion(gameEngine, theData[i].x,
                        theData[i].y, theData[i].typeID);
                    gameEngine.addEntity(newExplosion);
                    break;
                default: break;
            }
        }
    });
});

function entityInfo(typeID, x, y, direction) {
    this.typeID = typeID;
    this.x = x;
    this.y = y;
    this.direction = direction;
}