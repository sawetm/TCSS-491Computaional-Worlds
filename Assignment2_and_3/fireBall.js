function fireBall(game, x, y, thePid, direction) {
    Entity.call(this, game, x, y, thePid);
    
    this.pid = thePid;

    this.fireBallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/firen_ball.png"),
        0, 0, 80, 80, 0.1, 3, true, false);

    this.fireBallReflectAnimation = new Animation(ASSET_MANAGER.getAsset("./img/firen_ball_reflect.png"),
     1, 0, 80, 80, 0.1, 3, true, false);

    this.soundEffect = new Sound("./music/Explosion_Sound_Effect.mp3", 0.0, true);
    this.setBox(-40, -40, 40, 40);
    this.direction = direction;
    this.timesOfBoucing = 0;

    this.speed = 2;
    this.radius = 100;
    this.ground = 400;
}

fireBall.prototype = new Entity();
fireBall.prototype.constructor = fireBall;

fireBall.prototype.update = function () {

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        //console.log("print out ent = " + ent.pid);
        if (ent !== this && ent.pid === 3) {
            //console.log("First if");
            var cl = Entity.prototype.collide.call(this, ent);
            //console.log("testing cl = " + cl);
            //console.log("COLLIDE_LEFT = " + COLLIDE_LEFT + "COLLIDE_RIGHT = " + COLLIDE_RIGHT);
            if (cl == COLLIDE_LEFT || cl == COLLIDE_RIGHT) {
                //console.log("Second if");
                if (this.timesOfBoucing > 30 && ent.timesOfBoucing > 30) {

                    var explostion = new fireBallexplosion(this.game, (this.x + ent.x) / 2 - 50, this.y - 60, 4);
                    this.game.addEntity(explostion);
                    this.soundEffect.start();
                    this.removeFromWorld = true;
                    ent.removeFromWorld = true;
                } else {
                    //console.log("Somehow get into here");
                    this.direction *= -1;
                    this.timesOfBoucing++;
                    ent.timesOfBoucing++;
                }
            }
        }
    }

    if (this.x >= 720 || this.x <= -30) {
        this.direction *= -1;
    }

    this.x += 1.5 * this.direction;
    Entity.prototype.update.call(this);
}

fireBall.prototype.draw = function (ctx) {
    if(this.direction === 1) {
        this.fireBallAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else {
        this.fireBallReflectAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}