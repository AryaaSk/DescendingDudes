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
