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





//Actual Levels
const DemoLevel = () => {//creating level in new scope so that the obstacle names don't interfere with each other
    const level = new Level()

    const rotatingDisc1 = new RotatingDisc( { radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform( { width: 1000, depth: 3000 }, Vector( 0, 0, 1500 ) );
    const pendulumHammer1 = new PendulumHammer( { height: 300, gap: 400, hammerReach: 200, hammerSize: 100 }, Vector( -300, 0, 1500 ) );
    const jumpBar1 = new JumpBar( { length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar( { length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
    const rotatingDisc2 = new RotatingDisc( { radius: 300 }, Vector(0, 0, 3000), { colour: "#ff8000", rotationSpeed: -1 });
    level.obstacles =  [
        rotatingDisc1, 
        platform1, 
        pendulumHammer1, 
        jumpBar1, 
        jumpBar2, 
        rotatingDisc2
    ];

    level.layers =  {   
        bottom: [rotatingDisc1.base.aShape,  
                platform1.physicalObject.aShape, 
                rotatingDisc2.base.aShape], 
    
        middle: [rotatingDisc1.disc.aShape,
                jumpBar1.base.aShape,
                jumpBar2.base.aShape,
                rotatingDisc2.disc.aShape],
    
        top:    [pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
                jumpBar1.bar.aShape,
                jumpBar2.bar.aShape]
    };
    return level;
}

const DemoLevel2 = () => {//creating level in new scope so that the obstacle names don't interfere with each other
    const level = new Level()

    const rotatingDisc1 = new RotatingDisc( { radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform( { width: 1000, depth: 3000 }, Vector( 0, 0, 1500 ) );
    const pendulumHammer1 = new PendulumHammer( { height: 300, gap: 400, hammerReach: 175, hammerSize: 100 }, Vector( -300, 0, 1500 ) );
    const jumpBar1 = new JumpBar( { length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar( { length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
    const rotatingDisc2 = new RotatingDisc( { radius: 500 }, Vector(0, 0, 3000), { colour: "#ff0000", rotationSpeed: -10 });
    level.obstacles =  [
        rotatingDisc1, 
        platform1, 
        pendulumHammer1, 
        jumpBar1, 
        jumpBar2, 
        rotatingDisc2
    ];

    level.layers =  {   
        bottom: [rotatingDisc1.base.aShape,  
                platform1.physicalObject.aShape, 
                rotatingDisc2.base.aShape], 
    
        middle: [rotatingDisc1.disc.aShape,
                jumpBar1.base.aShape,
                jumpBar2.base.aShape,
                rotatingDisc2.disc.aShape],
    
        top:    [pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
                jumpBar1.bar.aShape,
                jumpBar2.bar.aShape]
    };
    return level;
}