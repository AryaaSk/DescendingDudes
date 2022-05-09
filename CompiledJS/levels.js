"use strict";
class Level {
    constructor() {
        this.obstacles = [];
        this.layers = { bottom: [], middle: [], top: [] };
        this.updateCallback = () => { }; //DO NOT USE THIS FOR UPDATING ARYAA3D SHAPES, if the level wants to perform an action which is not performed by individual obstacles, e.g. a moving platform. 
        this.spawnPoint = Vector(0, 500, 0);
        this.respawnPoint = Vector(0, 500, 0);
        this.finishZ = 3000; //Z coordinate of which the player has to pass to finish, 3000 by default just so that the level is not automatically completed
        if (GameConfig.player == undefined) {
            console.trace("Please specifify a player object in the GameConfig");
            return;
        }
        if (GameConfig.camera == undefined) {
            console.error("Please specifify a camera object in the GameConfig");
            return;
        }
    }
    spawnPlayer(playerPosition) {
        GameConfig.player.physicsObject.cBody.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
    }
    updateAShapes() {
        for (const obstacle of this.obstacles) {
            obstacle.update();
        }
    }
    renderLevel() {
        GameConfig.camera.render(this.layers.bottom); //Bottom Layer (platforms)
        GameConfig.camera.render(this.layers.middle); //Middle layer, for obstacles such as moving platforms and bases
        GameConfig.camera.render(this.layers.top.concat([GameConfig.player.physicsObject.aShape])); //Top layer, for rendering player and player height obstacles
    }
}
//Actual Levels
const levels = []; //an array of functions, which will return a level when called
levels.push(() => {
    const level = new Level();
    level.spawnPoint = Vector(0, 500, 0);
    const rotatingDisc1 = new RotatingDisc({ radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform({ width: 1000, depth: 3000 }, Vector(0, 0, 1500));
    const pendulumHammer1 = new PendulumHammer({ height: 300, gap: 400, hammerReach: 200, hammerSize: 100 }, Vector(-300, 0, 1500));
    const jumpBar1 = new JumpBar({ length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar({ length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 3, colour: "#ff0000" });
    const movingPlatform1 = new Platform({ width: 400, depth: 200, thickness: 30 }, Vector(600, 100, 2000), { colour: "#0000ff" });
    const movingPlatform2 = new Platform({ width: 400, depth: 200, thickness: 30 }, Vector(-600, 100, 2000), { colour: "#0000ff" });
    const newMovingPlatform = new MovingPlatform({ width: 400, depth: 200, thickness: 30 }, { position1: Vector(0, 20, 1000), position2: Vector(0, 500, 1500) }, { colour: "#ff0000", speed: 0.5 });
    const rotatingDisc2 = new RotatingDisc({ radius: 300 }, Vector(0, 0, 3000), { colour: "#ff8000", rotationSpeed: -1 });
    level.obstacles = [
        rotatingDisc1,
        platform1,
        pendulumHammer1,
        jumpBar1,
        jumpBar2,
        movingPlatform1,
        movingPlatform2,
        rotatingDisc2,
        newMovingPlatform
    ];
    level.layers = {
        bottom: [rotatingDisc1.base.aShape,
            platform1.physicalObject.aShape,
            rotatingDisc2.base.aShape],
        middle: [rotatingDisc1.disc.aShape,
            jumpBar1.base.aShape,
            jumpBar2.base.aShape,
            rotatingDisc2.disc.aShape,
            movingPlatform1.physicalObject.aShape,
            movingPlatform2.physicalObject.aShape],
        top: [pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
            jumpBar1.bar.aShape,
            jumpBar2.bar.aShape,
            newMovingPlatform.physicalObject.aShape]
    };
    let movingPlatform1Direction = 5;
    let movingPlatform2Direction = -5;
    level.updateCallback = () => {
        if (movingPlatform1.physicalObject.cBody.position.x >= 1400) {
            movingPlatform1Direction = -5;
        }
        else if (movingPlatform1.physicalObject.cBody.position.x <= 600) {
            movingPlatform1Direction = 5;
        }
        movingPlatform1.physicalObject.cBody.position.x += movingPlatform1Direction;
        if (movingPlatform2.physicalObject.cBody.position.x >= -600) {
            movingPlatform2Direction = -5;
        }
        else if (movingPlatform2.physicalObject.cBody.position.x <= -1400) {
            movingPlatform2Direction = 5;
        }
        movingPlatform2.physicalObject.cBody.position.x += movingPlatform2Direction;
    };
    level.finishZ = 3000;
    return level;
});
levels.push(() => {
    const level = new Level();
    level.spawnPoint = Vector(0, 500, 4500);
    const spawnArea1 = new Platform({ width: 1000, depth: 2000 }, Vector(0, 0, 500), { colour: "#fcfb90" }); //z = 1500
    const spawnArea2 = new Platform({ width: 200, depth: 500 }, Vector(0, 0, 1750), { colour: "#fcfb90" }); //z = 2000
    const bouncyPlatform1 = new BouncyPlatform({ width: 400, depth: 400, thickness: 50 }, Vector(-500, -100, 1800), { colour: "#ff63ef" }); //z = 2000
    const bouncyPlatform2 = new BouncyPlatform({ width: 400, depth: 400, thickness: 50 }, Vector(500, -100, 1800), { colour: "#ff63ef" }); //z = 2000
    const bouncyPlatform3 = new BouncyPlatform({ width: 400, depth: 400, thickness: 50 }, Vector(0, -100, 2400), { colour: "#ff63ef" }); //z = 2600
    const bouncyPlatform4 = new BouncyPlatform({ width: 400, depth: 400, thickness: 50 }, Vector(-500, -100, 3000), { colour: "#ff63ef" }); //z = 3200
    const bouncyPlatform5 = new BouncyPlatform({ width: 400, depth: 400, thickness: 50 }, Vector(500, -100, 3000), { colour: "#ff63ef" }); //z = 3200
    const bouncyPlatform6 = new BouncyPlatform({ width: 400, depth: 400, thickness: 50 }, Vector(0, -100, 3600), { colour: "#ff63ef" }); //z = 3800
    const platform1 = new Platform({ width: 800, depth: 1000 }, Vector(0, 0, 4500), { colour: "#fcfb90" }); //z = 5000
    const rotatingDisc1 = new RotatingDisc({ radius: 400 }, Vector(-500, 0, 5500), { colour: "#369eff", rotationSpeed: -1 }); //z = 5900
    const rotatingDisc2 = new RotatingDisc({ radius: 400 }, Vector(500, 0, 5500), { colour: "#369eff" }); //z = 5900
    const rotatingDisc3 = new RotatingDisc({ radius: 600 }, Vector(0, 0, 6600), { colour: "#369eff" }); //z = 7200
    const jumpBar1 = new JumpBar({ length: 1200, height: 100 }, Vector(0, 100, 6600), { colour: "#ff63ef", rotationSpeed: -1 }); //z = 7200
    const platform2 = new Platform({ width: 1000, depth: 1000 }, Vector(0, 0, 7900), { colour: "#fcfb90" }); //z = 8400
    const ramp1 = new Platform({ width: 500, depth: 1000 }, Vector(0, 200, 8850), { colour: "#fcfb90" }); //z = 9300, y = 410
    const ramp1Quaternion = eulerToQuaternion(Euler(-25, 0, 0));
    ramp1.physicalObject.cBody.quaternion.set(ramp1Quaternion.x, ramp1Quaternion.y, ramp1Quaternion.z, ramp1Quaternion.w);
    const platform3 = new Platform({ width: 500, depth: 1500 }, Vector(0, 410, 10050), { colour: "#fcfb90" }); //z = 10800
    const platform4 = new Platform({ width: 500, depth: 1500 }, Vector(0, 410, 11550), { colour: "#fcfb90" }); //z = 12300
    const swingingHammer = new PendulumHammer({ height: 1000, gap: 1000, hammerReach: 900, hammerSize: 150 }, Vector(0, 410, 10800), { colour: "#ff63ef" }); //z = 12300
    const hammerSupportPlatform1 = new Platform({ width: 500, depth: 500 }, Vector(-500, 410, 10800), { colour: "#fcfb90" }); //z = 12300
    const hammerSupportPlatform2 = new Platform({ width: 500, depth: 500 }, Vector(500, 410, 10800), { colour: "#fcfb90" }); //z = 12300
    const finishArea = new Platform({ width: 2000, depth: 4000 }, Vector(0, 0, 15300), { colour: "#fcfafa" }); //z = 17300
    level.obstacles = [
        spawnArea1,
        spawnArea2,
        bouncyPlatform1,
        bouncyPlatform2,
        bouncyPlatform3,
        bouncyPlatform4,
        bouncyPlatform5,
        bouncyPlatform6,
        platform1,
        rotatingDisc1,
        rotatingDisc2,
        rotatingDisc3,
        jumpBar1,
        platform2,
        ramp1,
        platform3,
        platform4,
        swingingHammer,
        hammerSupportPlatform1,
        hammerSupportPlatform2,
        finishArea
    ];
    level.layers.bottom = [
        bouncyPlatform1.physicalObject.aShape,
        bouncyPlatform2.physicalObject.aShape,
        bouncyPlatform3.physicalObject.aShape,
        bouncyPlatform4.physicalObject.aShape,
        bouncyPlatform5.physicalObject.aShape,
        bouncyPlatform6.physicalObject.aShape,
        platform1.physicalObject.aShape,
        //rotatingDisc1.base.aShape, //don't need to render the bases
        //rotatingDisc2.base.aShape,
        //rotatingDisc3.base.aShape
        platform2.physicalObject.aShape,
        ramp1.physicalObject.aShape,
        platform3.physicalObject.aShape,
        platform4.physicalObject.aShape,
        hammerSupportPlatform1.physicalObject.aShape,
        hammerSupportPlatform2.physicalObject.aShape,
        finishArea.physicalObject.aShape
    ];
    level.layers.middle = [
        spawnArea1.physicalObject.aShape,
        spawnArea2.physicalObject.aShape,
        rotatingDisc1.disc.aShape,
        rotatingDisc2.disc.aShape,
        rotatingDisc3.disc.aShape,
    ];
    level.layers.top = [
        /*jumpBar1.base.aShape,*/ jumpBar1.bar.aShape,
        swingingHammer.support.aShape, swingingHammer.hammer.aShape
    ];
    level.finishZ = 15300;
    return level;
});
