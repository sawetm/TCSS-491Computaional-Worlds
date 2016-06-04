// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
var COLLIDE_LEFT = 3;
var COLLIDE_RIGHT = 4;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.paused = false;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.space = true;
        if (e.keyCode === 37) that.left = true;
        if (e.keyCode === 38) that.up = true;
        if (e.keyCode === 39) that.right = true;
        if (e.keyCode === 40) that.down = true;
        if (e.keyCode === 13) that.enter = true;

        //-------------------------------------------------
        if (e.keyCode === 65) that.Aleft = true;
        if (e.keyCode === 87) that.Wup = true;
        if (e.keyCode === 68) that.Dright = true;
        if (e.keyCode === 83) that.Sdown = true;


        //if (e.keyCode === 27 && that.paused === false) that.paused = true;
        //if (e.keyCode === 27 && that.paused === true) that.paused = false;
        console.log(e + "keycode keydown" + e.keyCode);
        e.preventDefault();
    }, false);
    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (e.keyCode === 37) that.left = false;
        if (e.keyCode === 38) that.up = false;
        if (e.keyCode === 39) that.right = false;
        if (e.keyCode === 40) that.down = false;
        if (e.keyCode === 13) that.enter = false;

        //-------------------------------------------------------
        if (e.keyCode === 65) that.Aleft = false;
        if (e.keyCode === 87) that.Wup = false;
        if (e.keyCode === 68) that.Dright = false;
        if (e.keyCode === 83) that.Sdown = false;

    //    console.log(e + "keycode" + e.keyCode);
        e.preventDefault();
    }, false);

   // console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
   // console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    if (!this.paused) {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
        this.space = null;
    } else {
        this.draw();
    }
    
}

function Entity(game, x, y, theTypeID) {
    this.game = game;
    this.x = x;
    this.y = y;
    if (theTypeID !== null) {
        this.typeID = theTypeID;
    } else {
        this.typeID = -1;
    }

    this.removeFromWorld = false;
}
//---------------------------------Set box for each fireball--------------------------------------
Entity.prototype.setBox = function (tlx, tly, brx, bry) {
    this.tldx = tlx; //top left dx from x; tldx < 0
    this.tldy = tly; //top left dy from y; tldy < 0
    this.brdx = brx; //bottom right dx from x; brdx > 0
    this.brdy = bry; //bottom right dy from y; brdy > 0
  //  console.log("setbox " + this.tldx + " " + this.tldy + " " + this.brdx + " " + this.brdy);
};
//-------------------------------------------------------------
Entity.prototype.collide = function (other) {
    var i = 0;

    if (other instanceof Entity) {
        i = this.collideLeftRight(other);
        //console.log("i is : " + i);
        if (i === 0) {
            //i = this.collideTopBottom(other);
        }
    }
    return i;
}
//---------------------------- bounce when ball collide each other -------------------------------------------------------------------
Entity.prototype.collideLeftRight = function (other) {
    var collided = false;
    var tl = this.x + this.tldx;
    var tr = this.x + this.brdx;
    var ol = other.x + other.tldx;
    var or = other.x + other.brdx;


    if (tl <= or && tr >= ol) {
        //console.log("second if statement");
        var ta = this.y + this.tldy;
        var tb = this.y + this.brdy;
        var oa = other.y + other.tldy;
        var ob = other.y + other.brdy;

        var collided = (ta <= oa && tb >= ob) || (ta >= oa && tb <= ob); //one is inside the other one
        if (!collided) {
            collided = Math.abs(Math.min(ta, oa) - Math.max(tb, ob)) <= Math.abs(ta - tb) + Math.abs(oa - ob);
        }
    }

    if (collided) {
        //console.log("COLLISION HAPPENED!");
        if (this.x > other.x) {
            return COLLIDE_LEFT; //other is in the left side
        } else {
            return COLLIDE_RIGHT; //other is in the right side
        }
    };
    return 0;
}
//----------------------------------------------------------------------------------------
Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}
function Sound(source, volume, loop) {
    this.source = source;
    this.volume = volume;
    this.loop = loop;
    var son;
    this.son = son;
    this.finish = false;
    this.stop = function () {
        document.body.removeChild(this.son);
    }
    this.start = function () {
        if (this.finish) return false;
        this.son = document.createElement("embed");
        this.son.setAttribute("src", this.source);
        this.son.setAttribute("hidden", "true");
        this.son.setAttribute("volume", this.volume);
        this.son.setAttribute("autostart", "true");
        this.son.setAttribute("loop", this.loop);
        document.body.appendChild(this.son);
    }
    this.remove = function () {
        document.body.removeChild(this.son);
        this.finish = true;
    }
    this.init = function (volume, loop) {
        this.finish = false;
        this.volume = volume;
        this.loop = loop;
    }
}
