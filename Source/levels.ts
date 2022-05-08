class Level { //Levels work by taking in all the references to the obstacles and also their aShapes, it is very important that they are references
    obstacles: Obstacle[] = [];
    layers: { bottom: Shape[], middle: Shape[], top: Shape[] } = { bottom: [], middle: [], top: [] };
    updateCallback: (() => void) = () => {}; //DO NOT USE THIS FOR UPDATING ARYAA3D SHAPES, if the level wants to perform an action which is not performed by individual obstacles, e.g. a moving platform. 

    constructor() {
        if (GameConfig.player == undefined) {
            console.trace("Please specifify a player object in the GameConfig");
            return;
        }
        if (GameConfig.camera == undefined) {
            console.error("Please specifify a camera object in the GameConfig");
            return;
        }
    }

    spawnPoint: XYZ = Vector(0, 500, 0);
    respawnPoint: XYZ = Vector(0, 500, 0);
    spawnPlayer( playerPosition: XYZ ) {
        GameConfig.player!.physicsObject.cBody.position.set( playerPosition.x, playerPosition.y, playerPosition.z );
    }

    finishZ: number = 3000; //Z coordinate of which the player has to pass to finish, 3000 by default just so that the level is not automatically completed
    
    updateAShapes() {
        for (const obstacle of this.obstacles) {
            obstacle.update();
        }
    }

    renderLevel() { //multiple render function calls for different y-values, since we limited rotation, the items will always be on top / parallel to each other
        GameConfig.camera!.render(this.layers.bottom); //Bottom Layer (platforms)
        GameConfig.camera!.render(this.layers.middle); //Middle layer, for obstacles such as moving platforms and bases
        GameConfig.camera!.render(this.layers.top.concat([GameConfig.player!.physicsObject.aShape])); //Top layer, for rendering player and player height obstacles
    }
}





//Actual Levels
const levels: (() => Level)[] = []; //an array of functions, which will return a level when called

levels.push(() => { //Demo level, to test obstacles
    const level = new Level()

    const rotatingDisc1 = new RotatingDisc( { radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform( { width: 1000, depth: 3000 }, Vector( 0, 0, 1500 ) );
    const pendulumHammer1 = new PendulumHammer( { height: 300, gap: 400, hammerReach: 200, hammerSize: 100 }, Vector( -300, 0, 1500 ) );
    const jumpBar1 = new JumpBar( { length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar( { length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 3, colour: "#ff0000" });
    const movingPlatform1 = new Platform( { width: 400, depth: 200, thickness: 30 }, Vector( 600, 100, 2000 ), { colour: "#0000ff" });
    const movingPlatform2 = new Platform( { width: 400, depth: 200, thickness: 30 }, Vector( -600, 100, 2000 ), { colour: "#0000ff" });
    const rotatingDisc2 = new RotatingDisc( { radius: 300 }, Vector(0, 0, 3000), { colour: "#ff8000", rotationSpeed: -1 });

    level.spawnPoint = Vector( 0, 500, 0 );

    level.obstacles =  [
        rotatingDisc1,
        platform1, 
        pendulumHammer1, 
        jumpBar1, 
        jumpBar2, 
        movingPlatform1,
        movingPlatform2,
        rotatingDisc2
    ];

    level.layers =  {   
        bottom: [rotatingDisc1.base.aShape,  
                platform1.physicalObject.aShape, 
                rotatingDisc2.base.aShape], 
    
        middle: [rotatingDisc1.disc.aShape,
                jumpBar1.base.aShape,
                jumpBar2.base.aShape,
                rotatingDisc2.disc.aShape,
                movingPlatform1.physicalObject.aShape,
                movingPlatform2.physicalObject.aShape],
    
        top:    [pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
                jumpBar1.bar.aShape,
                jumpBar2.bar.aShape]
    };

    let movingPlatform1Direction = 5;
    let movingPlatform2Direction = -5;
    level.updateCallback = () => {
        if (movingPlatform1.physicalObject.cBody.position.x >= 1400) { movingPlatform1Direction = -5; }
        else if (movingPlatform1.physicalObject.cBody.position.x <= 600) { movingPlatform1Direction = 5; }
        movingPlatform1.physicalObject.cBody.position.x += movingPlatform1Direction;

        if (movingPlatform2.physicalObject.cBody.position.x >= -600) { movingPlatform2Direction = -5; }
        else if (movingPlatform2.physicalObject.cBody.position.x <= -1400) { movingPlatform2Direction = 5; }
        movingPlatform2.physicalObject.cBody.position.x += movingPlatform2Direction;
    }

    return level;
})




levels.push(() => { //testing multiple levels
    const level = new Level()

    const rotatingDisc1 = new RotatingDisc( { radius: 400 }, Vector(0, 0, 0));
    const platform1 = new Platform( { width: 1000, depth: 3000 }, Vector( 0, 0, 1500 ) );
    const pendulumHammer1 = new PendulumHammer( { height: 600, gap: 400, hammerReach: 500, hammerSize: 150 }, Vector( -300, 0, 1500 ), { colour: "#800080", rotationSpeed: 2 });
    const jumpBar1 = new JumpBar( { length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
    const jumpBar2 = new JumpBar( { length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
    const rotatingDisc2 = new RotatingDisc( { radius: 500 }, Vector(0, 0, 3000), { colour: "#ff00ff", rotationSpeed: -2.5 });

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
})