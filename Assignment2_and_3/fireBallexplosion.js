function fireBallexplosion(game, x, y, thePid) {
    Entity.call(this, game, x, y, thePid);

    this.pid = thePid;

    this.fireBallExpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/firen_ball.png"),
            0, 175, 80, 70, 0.07, 4, false, false);

    this.direction = 1;
    this.speed = 5;
    this.radius = 100;
    this.ground = 400;
}

fireBallexplosion.prototype = new Entity();
fireBallexplosion.prototype.constructor = fireBallexplosion;

fireBallexplosion.prototype.update = function () {

    if (this.fireBallExpAnimation.isDone()) {
        this.fireBallExpAnimation.elapsedTime = 0;
        this.removeFromWorld = true;
    }

    Entity.prototype.update.call(this);

}

fireBallexplosion.prototype.draw = function (ctx) {

    this.fireBallExpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y + 70);
    Entity.prototype.draw.call(this);
}