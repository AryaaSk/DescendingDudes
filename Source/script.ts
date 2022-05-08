//CANNON Setup
let world: CANNON.World;

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
let player: Player;
LevelConfig.camera = camera; //camera never gets reset so we leave it outside the resetConfigs()

const resetConfigs = () => {
    world = new CANNON.World();
    world.gravity.set( 0, -9.82 * 100, 0 );

    player = new Player( world, camera ); //supplying the new objects to the config variables
    ObstacleConfig.world = world;
    LevelConfig.player = player;
}


//Levels
let currentLevel: Level;

const loadLevel = ( levelIndex: number ) => {
    //need to remove all bodies, so that the levels don't stack on top of each other
    resetConfigs();
    
    switch (levelIndex){
        case 0:
            currentLevel = DemoLevel();
            break;
        case 1:
            currentLevel = DemoLevel2();
            break;

        default:
            console.error("Invalid level index");
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