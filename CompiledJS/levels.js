"use strict";
const LevelConfig = {
    player: undefined,
    camera: undefined,
};
class Level {
    constructor() {
        this.obstacles = [];
        this.layers = { bottom: [], middle: [], top: [] };
        if (LevelConfig.player == undefined) {
            console.trace("Please specifify a player object in the LevelConfig");
            return;
        }
        if (LevelConfig.camera == undefined) {
            console.error("Please specifify a camera object in the LevelConfig");
            return;
        }
    }
    spawnPlayer(playerPosition) {
        LevelConfig.player.physicsObject.cBody.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
    }
    updateAShapes() {
        for (const obstacle of this.obstacles) {
            obstacle.update();
        }
    }
    renderLevel() {
        var _a, _b, _c;
        (_a = LevelConfig.camera) === null || _a === void 0 ? void 0 : _a.render(this.layers.bottom); //Bottom Layer (platforms)
        (_b = LevelConfig.camera) === null || _b === void 0 ? void 0 : _b.render(this.layers.middle); //Middle layer, for obstacles such as moving platforms and bases
        (_c = LevelConfig.camera) === null || _c === void 0 ? void 0 : _c.render(this.layers.top.concat([LevelConfig.player.physicsObject.aShape])); //Top layer, for rendering player and player height obstacles
    }
}
//Actual Levels
const DemoLevel = () => {
    const level = new Level();
    const rotatingDisc1 = new RotatingDisc({ radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform({ width: 1000, depth: 3000 }, Vector(0, 0, 1500));
    const pendulumHammer1 = new PendulumHammer({ height: 300, gap: 400, hammerReach: 200, hammerSize: 100 }, Vector(-300, 0, 1500));
    const jumpBar1 = new JumpBar({ length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar({ length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
    const rotatingDisc2 = new RotatingDisc({ radius: 300 }, Vector(0, 0, 3000), { colour: "#ff8000", rotationSpeed: -1 });
    level.obstacles = [
        rotatingDisc1,
        platform1,
        pendulumHammer1,
        jumpBar1,
        jumpBar2,
        rotatingDisc2
    ];
    level.layers = {
        bottom: [rotatingDisc1.base.aShape,
            platform1.physicalObject.aShape,
            rotatingDisc2.base.aShape],
        middle: [rotatingDisc1.disc.aShape,
            jumpBar1.base.aShape,
            jumpBar2.base.aShape,
            rotatingDisc2.disc.aShape],
        top: [pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
            jumpBar1.bar.aShape,
            jumpBar2.bar.aShape]
    };
    return level;
};
const DemoLevel2 = () => {
    const level = new Level();
    const rotatingDisc1 = new RotatingDisc({ radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform({ width: 1000, depth: 3000 }, Vector(0, 0, 1500));
    const pendulumHammer1 = new PendulumHammer({ height: 300, gap: 400, hammerReach: 175, hammerSize: 100 }, Vector(-300, 0, 1500));
    const jumpBar1 = new JumpBar({ length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar({ length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
    const rotatingDisc2 = new RotatingDisc({ radius: 500 }, Vector(0, 0, 3000), { colour: "#ff0000", rotationSpeed: -10 });
    level.obstacles = [
        rotatingDisc1,
        platform1,
        pendulumHammer1,
        jumpBar1,
        jumpBar2,
        rotatingDisc2
    ];
    level.layers = {
        bottom: [rotatingDisc1.base.aShape,
            platform1.physicalObject.aShape,
            rotatingDisc2.base.aShape],
        middle: [rotatingDisc1.disc.aShape,
            jumpBar1.base.aShape,
            jumpBar2.base.aShape,
            rotatingDisc2.disc.aShape],
        top: [pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
            jumpBar1.bar.aShape,
            jumpBar2.bar.aShape]
    };
    return level;
};
