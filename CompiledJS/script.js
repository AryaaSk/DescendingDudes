"use strict";
//Aryaa3D Setup
linkCanvas("renderingWindow");
//GameHelper Setup
enableKeyListeners();
//Config Setups
let GAME_CONFIG = {
    player: undefined,
    world: undefined,
    camera: new PerspectiveCamera()
};
GAME_CONFIG.camera.rotation.x = 20;
GAME_CONFIG.camera.updateRotationMatrix();
GAME_CONFIG.camera.clipOffset = 10;
;
let CAMERA_OFFSET = Vector(0, 100, -800); //changed based on camera's x rotation
const resetWorld = () => {
    GAME_CONFIG.world = new CANNON.World(); //Need to remove all bodies, so that the levels don't stack on top of each other
    GAME_CONFIG.world.gravity.set(0, -9.82 * 100, 0);
    GAME_CONFIG.player = new Player(GAME_CONFIG.world, GAME_CONFIG.camera); //Creating a new Player object with the newly created CANNON World
    GAME_CONFIG.camera.rotation.y = 0; //Resetting camera rotation, since player rotation will also be reset
    GAME_CONFIG.camera.updateRotationMatrix();
};
//Levels
let CURRENT_LEVEL_INDEX;
let currentLevel;
const loadLevel = (levelIndex) => {
    if (levelIndex >= LEVELS.length) {
        console.error(`CANNOT LOAD LEVEL ${String(levelIndex)}: invalid level index`);
        return;
    }
    //before changing CURRENT_LEVEL_INDEX, remove the playerID from the current level in firebase
    removePlayerID(CURRENT_LEVEL_INDEX);
    resetWorld();
    CURRENT_LEVEL_INDEX = levelIndex;
    currentLevel = LEVELS[levelIndex]();
    currentLevel.spawnPlayer(currentLevel.spawnPoint);
    clearInactivePlayers(levelIndex).then(() => {
        syncOtherPlayers(CURRENT_LEVEL_INDEX); //clear inactive players before syncing them to avoid creating unnessecary physicsObjects
    });
};
//Extra Utilites
const showMessage = (text, permanant) => {
    const label = document.getElementById("message");
    label.innerText = text;
    if (permanant == true) {
        return;
    } //permanant text not working for some reason
    setTimeout(() => {
        label.innerText = "";
    }, 2000);
};
//Game flow, just load each level using loadLevel( levelIndex );
loadLevel(1);
//Multiplayer
setInterval(() => {
    uploadPlayerData(); //syncPlayerData is called in loadLevel
}, 50);
updateLastOnline(); //update as soon as loaded, and then update every 5 seconds
setInterval(() => {
    updateLastOnline();
}, 5000);
//Game loop
const gameLoop = setInterval(() => {
    if (isMobile == false) {
        handleKeysDown();
    }
    else {
        handleMobileControls();
    }
    //Update world / level
    currentLevel.updateCallback();
    GAME_CONFIG.world.step(16 / 1000);
    uploadPlayerData();
    //Sync aryaa3D Shapes
    GAME_CONFIG.player.update(GAME_CONFIG.camera);
    currentLevel.updateAShapes();
    //Render level
    clearCanvas();
    currentLevel.renderLevel(OTHER_PLAYERS_A_SHAPES);
    //Check if player's y coordinate is < -400, if so then the player has fallen off the map and gets respawned
    if (GAME_CONFIG.player.physicsObject.cBody.position.y <= -400) {
        showMessage("Player fell off the map, respawning now...");
        currentLevel.spawnPlayer(currentLevel.respawnPoint);
    }
    //Check if player's z coordinate is >= current level's finishZ, if so then the player has finished the level and load next level
    if (GAME_CONFIG.player.physicsObject.cBody.position.z >= currentLevel.finishZ) {
        showMessage(`Player has completed level ${String(CURRENT_LEVEL_INDEX)}`);
        if (CURRENT_LEVEL_INDEX == (LEVELS.length - 1)) {
            showMessage("Congradulations, you have finished all the levels", true);
            clearInterval(gameLoop);
        }
        else {
            loadLevel(CURRENT_LEVEL_INDEX + 1);
        }
    }
}, 16);
document.getElementById("levelSelect").onclick = () => {
    const level = prompt("Please enter a level number to go to");
    try {
        const levelIndex = Number(level);
        loadLevel(levelIndex);
    }
    catch (_a) {
        alert("Invalid level number");
    }
};
document.getElementById("resetServer").onclick = () => {
    const password = prompt("Enter password to reset server");
    if (password == "nothing321") {
        resetServer();
        location.reload();
    }
    else {
        alert("Wrong password");
    }
};
//MOVEMENT CONTROLS
const handleKeysDown = () => {
    const pMovement = Vector(0, 0, 0);
    keysDown.forEach((key) => {
        if (key == "w") {
            pMovement.z += GAME_CONFIG.player.speed;
        }
        else if (key == "s") {
            pMovement.z -= GAME_CONFIG.player.speed;
        }
        else if (key == "a") {
            pMovement.x -= GAME_CONFIG.player.speed;
        }
        else if (key == "d") {
            pMovement.x += GAME_CONFIG.player.speed;
        }
        else if (key == " ") {
            GAME_CONFIG.player.jump(GAME_CONFIG.player.jumpForce); //validation happens inside player class
        }
    });
    GAME_CONFIG.player.moveLocal(pMovement);
};
//Mobile Modifications
if (isMobile == true) { //adjusting proportions so it is easier to see on mobile
    const cameraZoomWidth = (window.innerWidth) / 800;
    const cameraZoomHeight = (window.innerHeight) / 800;
    GAME_CONFIG.camera.zoom = cameraZoomWidth; //set to lowest
    if (cameraZoomHeight < cameraZoomWidth) {
        GAME_CONFIG.camera.zoom = cameraZoomHeight;
    }
}
//Mobile Controls
let joy;
let jumpPressed = false;
if (isMobile == false) {
    document.addEventListener('click', () => {
        document.body.requestPointerLock();
    }, { once: false });
    document.getElementById("jumpButton").style.display = "none";
}
else {
    //initialize joystick
    joy = new JoyStick('joyDiv', { internalFillColor: "#ff0000", internalStrokeColor: "#000000", externalStrokeColor: "#000000" });
    //initalize jump listener
    document.getElementById("jumpButton").ontouchstart = () => {
        jumpPressed = true;
    };
}
const handleMobileControls = () => {
    const maxiumumRadius = 100; //joystick.width / 2, or joystick.height, since they should be set to the same
    const [x, y] = [joy.GetX(), joy.GetY()];
    const pMovement = Vector(x, 0, y);
    const pMovementNormalized = Vector(pMovement.x * (GAME_CONFIG.player.speed / maxiumumRadius), 0, pMovement.z * (GAME_CONFIG.player.speed / maxiumumRadius));
    GAME_CONFIG.player.moveLocal(pMovementNormalized);
    //If jump button was pressed then jumpPressed will be true
    if (jumpPressed == true) {
        GAME_CONFIG.player.jump(GAME_CONFIG.player.jumpForce);
    }
    jumpPressed = false;
};
