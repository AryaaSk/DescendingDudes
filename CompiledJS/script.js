"use strict";
//GameHelper Setup
enableKeyListeners();
document.addEventListener('click', () => {
    document.body.requestPointerLock();
}, { once: false });
//Aryaa3D Setup
linkCanvas("renderingWindow");
//Config Setups
let GameConfig = { player: undefined, world: undefined, camera: undefined };
GameConfig.camera = new PerspectiveCamera();
; //camera never gets reset so we leave it outside the resetConfigs()
GameConfig.camera.rotation.x = 20;
GameConfig.camera.updateRotationMatrix();
GameConfig.camera.clipOffset = 10;
;
const cameraOffset = Vector(0, 500, -800);
const resetConfigs = () => {
    GameConfig.world = new CANNON.World(); //Need to remove all bodies, so that the levels don't stack on top of each other
    GameConfig.world.gravity.set(0, -9.82 * 100, 0);
    GameConfig.player = new Player(GameConfig.world, GameConfig.camera); //Creating a new Player object with the newly created CANNON World
};
//Levels
let currentLevelIndex;
let currentLevel;
const loadLevel = (levelIndex) => {
    if (levelIndex >= levels.length) {
        console.error(`CANNOT LOAD LEVEL ${String(levelIndex)}: invalid level index`);
        return;
    }
    resetConfigs();
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex]();
    currentLevel.spawnPlayer(currentLevel.spawnPoint);
};
//Game flow, just load each level using loadLevel( levelIndex );
loadLevel(0);
//ANIMATION LOOP
const gameLoop = setInterval(() => {
    //Handle keysdown
    const pMovement = Vector(0, 0, 0);
    keysDown.forEach((key) => {
        if (key == "w") {
            pMovement.z += GameConfig.player.speed;
        }
        else if (key == "s") {
            pMovement.z -= GameConfig.player.speed;
        }
        else if (key == "a") {
            pMovement.x -= GameConfig.player.speed;
        }
        else if (key == "d") {
            pMovement.x += GameConfig.player.speed;
        }
        else if (key == " ") {
            GameConfig.player.jump(GameConfig.player.jumpForce); //validation happens inside player class
        }
    });
    GameConfig.player.moveLocal(pMovement);
    //Update world / level
    currentLevel.updateCallback();
    GameConfig.world.step(16 / 1000);
    //Sync aryaa3D Shapes
    GameConfig.player.update(GameConfig.camera, cameraOffset);
    currentLevel.updateAShapes();
    //Render level
    clearCanvas();
    currentLevel.renderLevel();
    //Check if player's y coordinate is < -400, if so then the player has fallen off the map and gets respawned
    if (GameConfig.player.physicsObject.cBody.position.y <= -400) {
        console.warn("Player died (y <= -400), respawning now...");
        currentLevel.spawnPlayer(currentLevel.respawnPoint);
    }
    //Check if player's z coordinate is >= current level's finishZ, if so then the player has finished the level and load next level
    if (GameConfig.player.physicsObject.cBody.position.z >= currentLevel.finishZ) {
        console.log(`Player has completed level ${String(currentLevelIndex)}`);
        if (currentLevelIndex == (levels.length - 1)) {
            console.log("Congradulations, you have finished all the levels");
            clearInterval(gameLoop);
        }
        else {
            loadLevel(currentLevelIndex + 1);
        }
    }
}, 16);
