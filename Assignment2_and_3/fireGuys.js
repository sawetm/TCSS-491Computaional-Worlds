
function fireguy(game, x, y, typeID) {

    this.reflectAnimation = new Animation(ASSET_MANAGER.getAsset("./img/firen_0_reflect.png"), 560, 0, 80, 86, 0.15, 3, true, true);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/firen_1_reflect.png"), 400, 165, 80, 80, 0.15, 5, false, true);
    this.animationWalk = new Animation(ASSET_MANAGER.getAsset("./img/firen_0_reflect.png"), 160, 0, 80, 86, 0.15, 5, true, true);
    this.animationWalkBack = new Animation(ASSET_MANAGER.getAsset("./img/firen_0.png"), 160, 0, 80, 86, 0.15, 5, true, false);

    this.walking = false;
    this.jumping = false;
    this.radius = 100;
    this.ground = 435;
    this.pid = typeID;
    //-------------------------------------------------------------------
    this.fireBallCountDown = 0;
    this.fireBallNumber;
    Entity.call(this, game, x, y, typeID); // set up the the animate start at
}

fireguy.prototype = new Entity();
fireguy.prototype.constructor = fireguy;

fireguy.prototype.update = function () {
    if (this.game.enter) {
        if (!this.jumping) {
            this.jumping = true;
            this.ground = this.y;
        }
    }
    //------------------- add fire ball------------------------------------
    if (this.fireBallCountDown === 100) {

        var testing = new fireBall(this.game, this.x-15 , this.y, 3, -1);
        this.game.addEntity(testing);
        this.fireBallCountDown = 0;
        this.fireBallNumber++;
    } else {
        this.fireBallCountDown++;
    }
    //-----------------------------------------------------------------------------------
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
        this.x = this.x - 1;
    } 
    //-------------------------------------------------------------------------------------
    if (this.game.up) {
        if (this.y > 0) // 435
            this.y = this.y - 7;
    }

    if (this.game.down) {
        if (this.y < 810 - 100)
            this.y = this.y + 7;
    }

    if (this.game.left) {
        console.log(this.x);
        if (this.x > 0)
            this.x = this.x - 7;
    }
    if (this.game.right) {
        console.log(this.x);
        if (this.x < 800 - 80)
            this.x = this.x + 7;
    }
    //---------------------------------------------------
    Entity.prototype.update.call(this);
}

fireguy.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else if (this.game.left || this.game.up || this.game.down) {
        this.animationWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if (this.game.right) {
        this.animationWalkBack.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.reflectAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}
