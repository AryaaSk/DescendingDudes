declare let isMobile: boolean;
declare var JoyStick: any;

//GameHelper Setup
enableKeyListeners();

let joy: any;
let jumpPressed = false;
if (isMobile == false) {
    document.addEventListener('click', () => { //full screen mode
        document.body.requestPointerLock();
    }, { once: false })

    document.getElementById("jumpButton")!.style.display = "none";
}
else {
    //initialize joystick
    joy = new JoyStick('joyDiv', {internalFillColor: "#ff0000", internalStrokeColor: "#000000", externalStrokeColor: "#000000" });

    //initalize jump listener
    document.getElementById("jumpButton")!.ontouchstart = () => {
        jumpPressed = true;
    }
}

//Aryaa3D Setup
linkCanvas("renderingWindow")

//Config Setups
let GameConfig: {
    player?: Player,
    world?: CANNON.World,
    camera?: PerspectiveCamera,
} = { player: undefined, world: undefined, camera: undefined }

GameConfig.camera = new PerspectiveCamera();; //camera never gets reset so we leave it outside the resetConfigs()
GameConfig.camera.rotation.x = 20;
GameConfig.camera.updateRotationMatrix();
GameConfig.camera.clipOffset = 10;;
let CAMERA_OFFSET = Vector( 0, 100, -800 );

if (isMobile == true) { //adjusting proportions so it is easier to see on mobile
    const cameraZoomWidth = (window.innerWidth) / 800;
    const cameraZoomHeight = (window.innerHeight) / 800;
    GameConfig.camera.zoom = cameraZoomWidth; //set to lowest
    if (cameraZoomHeight < cameraZoomWidth) {
        GameConfig.camera.zoom = cameraZoomHeight;
    }
}

const resetConfigs = () => {
    GameConfig.world = new CANNON.World(); //Need to remove all bodies, so that the levels don't stack on top of each other
    GameConfig.world.gravity.set( 0, -9.82 * 100, 0 );
    GameConfig.player = new Player( GameConfig.world, GameConfig.camera! ); //Creating a new Player object with the newly created CANNON World
    GameConfig.camera!.rotation.y = 0; //Resetting camera rotation, since player rotation will also be reset
    GameConfig.camera!.updateRotationMatrix();
}

//Levels
let currentLevelIndex: number;
let currentLevel: Level;

const loadLevel = ( levelIndex: number ) => {
    if (levelIndex >= levels.length) {
        console.error(`CANNOT LOAD LEVEL ${String(levelIndex)}: invalid level index`);
        return;
    }

    resetConfigs();
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex]();
    currentLevel.spawnPlayer( currentLevel.spawnPoint );
}
    


//Extra Utilites
const showMessage = (text: string, permanant?: boolean) => {
    const label = document.getElementById("message")!;
    label.innerText = text;
    if (permanant == true) { return; } //permanant text not working for some reason

    setTimeout(() => {
        label.innerText = "";
    }, 2000);
}

//Game flow, just load each level using loadLevel( levelIndex );
loadLevel( 1 );



const gameLoop = setInterval(() => {
    if (isMobile == false) { handleKeysDown(); }
    else { handleMobileControls(); }

    //Update world / level
    currentLevel.updateCallback();
    GameConfig.world!.step(16 / 1000);

    //Sync aryaa3D Shapes
    GameConfig.player!.update( GameConfig.camera! );
    currentLevel.updateAShapes();

    //Render level
    clearCanvas();
    currentLevel.renderLevel();

    //Check if player's y coordinate is < -400, if so then the player has fallen off the map and gets respawned
    if (GameConfig.player!.physicsObject.cBody.position.y <= -400) {
        showMessage("Player fell off the map, respawning now...")
        currentLevel.spawnPlayer( currentLevel.respawnPoint );
    }

    //Check if player's z coordinate is >= current level's finishZ, if so then the player has finished the level and load next level
    if (GameConfig.player!.physicsObject.cBody.position.z >= currentLevel.finishZ) {
        showMessage(`Player has completed level ${String(currentLevelIndex)}`)

        if (currentLevelIndex == (levels.length - 1)) {
            showMessage("Congradulations, you have finished all the levels", true)

            clearInterval(gameLoop);
        }
        else {
            loadLevel( currentLevelIndex + 1 );
        }
    }
}, 16);

const handleKeysDown = () => {
    const pMovement = Vector(0, 0, 0);
    keysDown.forEach((key) => {
        if (key == "w") {  pMovement.z += GameConfig.player!.speed; }
        else if (key == "s") { pMovement.z -= GameConfig.player!.speed; }
        else if (key == "a") { pMovement.x -= GameConfig.player!.speed; }
        else if (key == "d") { pMovement.x += GameConfig.player!.speed; }

        else if (key == " ") { 
            GameConfig.player!.jump( GameConfig.player!.jumpForce ); //validation happens inside player class
        }
    })
    GameConfig.player!.moveLocal( pMovement );

}
const handleMobileControls = () => {
    const maxiumumRadius = 100; //joystick.width / 2, or joystick.height, since they should be set to the same
    const [x, y] = [joy.GetX(), joy.GetY()];

    const pMovement = Vector( x, 0, y );
    const pMovementNormalized = Vector( pMovement.x * (GameConfig.player!.speed / maxiumumRadius), 0, pMovement.z * (GameConfig.player!.speed / maxiumumRadius) );
    GameConfig.player!.moveLocal( pMovementNormalized );


    //If jump button was pressed then jumpPressed will be true
    if (jumpPressed == true) {
        GameConfig.player!.jump( GameConfig.player!.jumpForce );
    }
    jumpPressed = false;
}