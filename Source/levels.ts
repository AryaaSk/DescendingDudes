const LevelConfig: {
    player?: Player
    camera?: PerspectiveCamera
} = {
    player: undefined,
    camera: undefined,
};

class Level { //Levels work by taking in all the references to the obstacles and also their aShapes, it is very important that they are references
    obstacles: Obstacle[] = [];
    layers: { bottom: Shape[], middle: Shape[], top: Shape[] } = { bottom: [], middle: [], top: [] };

    constructor() {
        if (LevelConfig.player == undefined) {
            console.trace("Please specifify a player object in the LevelConfig");
            return;
        }
        if (LevelConfig.camera == undefined) {
            console.error("Please specifify a camera object in the LevelConfig");
            return;
        }
    }

    spawnPlayer( playerPosition: XYZ ) {
        LevelConfig.player!.physicsObject.cBody.position.set( playerPosition.x, playerPosition.y, playerPosition.z );
    }

    updateAShapes() {
        for (const obstacle of this.obstacles) {
            obstacle.update();
        }
    }

    renderLevel() { //multiple render function calls for different y-values, since we limited rotation, the items will always be on top / parallel to each other
        LevelConfig.camera?.render(this.layers.bottom); //Bottom Layer (platforms)
        LevelConfig.camera?.render(this.layers.middle); //Middle layer, for obstacles such as moving platforms and bases
        LevelConfig.camera?.render(this.layers.top.concat([LevelConfig.player!.physicsObject.aShape])); //Top layer, for rendering player and player height obstacles
    }
}