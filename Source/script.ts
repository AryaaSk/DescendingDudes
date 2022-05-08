//CANNON Setup
let world = new CANNON.World();

//Aryaa3D Setup
linkCanvas("renderingWindow")
const camera = new PerspectiveCamera();
camera.rotation.x = 20;
camera.updateRotationMatrix();
camera.clipOffset = 10;;
const cameraOffset = Vector( 0, 500, -800 );

//GameHelper Setup
enableKeyListeners();

document.addEventListener('click', () => { //full screen mode
    document.body.requestPointerLock();
}, { once: false })


//Config Setups
let player = new Player( world, camera );
LevelConfig.camera = camera; //camera never gets reset so we leave it outside the resetConfigs()

const resetConfigs = () => {
    world = new CANNON.World();
    world.gravity.set( 0, -9.82 * 100, 0 );

    player = new Player( world, camera ); //supplying the new objects to the config variables
    obstacleConfig.world = world;
    LevelConfig.player = player;
}


//Levels
let currentLevel: Level;
const loadLevel = ( levelIndex: number ) => {
    //need to remove all bodies, so that the levels don't stack on top of each other
    resetConfigs();

    if ( levelIndex == 0 ) { //Test Level, to test the obstacles
        currentLevel = new Level()

        const rotatingDisc1 = new RotatingDisc( { radius: 400 }, Vector(0, 0, 0));
        const platform1 = new Platform( { width: 1000, depth: 3000 }, Vector( 0, 0, 1500 ) );
        const pendulumHammer1 = new PendulumHammer( { height: 300, gap: 400, hammerReach: 100, hammerSize: 100 }, Vector( -300, 0, 1500 ) );
        const jumpBar1 = new JumpBar( { length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
        const jumpBar2 = new JumpBar( { length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
        const rotatingDisc2 = new RotatingDisc( { radius: 300 }, Vector(0, 0, 3000), { colour: "#ff8000", rotationSpeed: -1 });
        currentLevel.obstacles =  [
            rotatingDisc1, 
            platform1, 
            pendulumHammer1, 
            jumpBar1, 
            jumpBar2, 
            rotatingDisc2
        ];

        currentLevel.layers =  {   
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
    }



    else if ( levelIndex == 1 ) { //Just another test level, to test level loading
        currentLevel= new Level()

        const rotatingDisc1 = new RotatingDisc( { radius: 400 }, Vector(0, 0, 0));
        const platform1 = new Platform( { width: 1000, depth: 3000 }, Vector( 0, 0, 1500 ) );
        const pendulumHammer1 = new PendulumHammer( { height: 500, gap: 400, hammerReach: 400, hammerSize: 100 }, Vector( -300, 0, 1500 ) );
        const jumpBar1 = new JumpBar( { length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
        const jumpBar2 = new JumpBar( { length: 600 }, Vector(300, 5, 1500), { rotationSpeed: 1, colour: "#ff0000" });
        const rotatingDisc2 = new RotatingDisc( { radius: 100 }, Vector(0, 0, 3000), { colour: "#ff0000", rotationSpeed: 10 });
        currentLevel.obstacles =  [
            rotatingDisc1, 
            platform1, 
            pendulumHammer1, 
            jumpBar1, 
            jumpBar2, 
            rotatingDisc2
        ];

        currentLevel.layers =  {   
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
    }

    currentLevel.spawnPlayer( Vector(0, 500, 0) );
}
    



//Game flow, just load each level using loadLevel( levelIndex );
loadLevel( 0 );



//ANIMATION LOOP
setInterval(() => {

    //Handle keysdown
    const pMovement = Vector(0, 0, 0);
    keysDown.forEach((key) => {
        if (key == "w") {  pMovement.z += player.speed; }
        else if (key == "s") { pMovement.z -= player.speed; }
        else if (key == "a") { pMovement.x -= player.speed; }
        else if (key == "d") { pMovement.x += player.speed; }

        else if (key == " ") { 
            player.jump( player.jumpForce ); //validation happens inside player class
        }
    })
    player.moveLocal( pMovement );

    //Update world
    world.step(16 / 1000);

    //Sync aryaa3D Shapes
    player.update( camera, cameraOffset );
    currentLevel.updateAShapes();

    //Render level
    clearCanvas();
    currentLevel.renderLevel();

    //check if player's y coordinate is < -400, if so then the player has fallen off the map and gets respawned
    if (player.physicsObject.cBody.position.y <= -400) {
        console.warn("Player died (y <= -400), respawning now...");
        currentLevel.spawnPlayer( Vector(0, 500, 0) );
    }

}, 16);