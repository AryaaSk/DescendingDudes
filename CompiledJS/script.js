"use strict";
//Setup
//CannonJS Setup
const world = new CANNON.World();
world.gravity.set(0, -9.82 * 100, 0); // *100 to scale into the world
//Aryaa3D Setup
linkCanvas("renderingWindow");
const camera = new PerspectiveCamera();
camera.rotation.x = 20;
camera.updateRotationMatrix();
camera.clipOffset = 10;
;
const cameraOffset = Vector(0, 500, -800);
//GameHelper Setup
enableKeyListeners();
document.addEventListener('click', () => {
    document.body.requestPointerLock();
}, { once: false });
//Player
const player = new Player(world, camera);
player.physicsObject.cBody.position.set(0, 500, 0);
//Obstacles, ordered in order of appearance in the Level
obstacleConfig.world = world;
const rotatingDisc1 = new RotatingDisc({ radius: 400 }, Vector(0, 0, 0));
const platform1 = new Platform({ width: 1000, depth: 3000 }, Vector(0, 0, 1500));
const pendulumHammer1 = new PendulumHammer({ height: 300, gap: 400, hammerReach: 100, hammerSize: 100 }, Vector(-300, 0, 1500));
const jumpBar1 = new JumpBar({ length: 800 }, Vector(0, 50, 0), { rotationSpeed: -1 });
const jumpBar2 = new JumpBar({ length: 600 }, Vector(300, 100, 1500), { rotationSpeed: 1, colour: "#ff0000" });
const rotatingDisc2 = new RotatingDisc({ radius: 300 }, Vector(0, 0, 3000), { colour: "#ff8000", rotationSpeed: -1 });
//ANIMATION LOOP
setInterval(() => {
    //Handle keysdown
    const pMovement = Vector(0, 0, 0);
    keysDown.forEach((key) => {
        if (key == "w") {
            pMovement.z += player.speed;
        }
        else if (key == "s") {
            pMovement.z -= player.speed;
        }
        else if (key == "a") {
            pMovement.x -= player.speed;
        }
        else if (key == "d") {
            pMovement.x += player.speed;
        }
        else if (key == " ") {
            player.jump(player.jumpForce); //validation happens inside player class
        }
    });
    player.moveLocal(pMovement);
    //Update world
    world.step(16 / 1000);
    //Sync aryaa3D Shapes
    player.update(camera, cameraOffset);
    rotatingDisc1.update();
    platform1.update();
    pendulumHammer1.update();
    jumpBar1.update();
    jumpBar2.update();
    rotatingDisc2.update();
    //multiple render function calls for different y-values, since we limited rotation, the items will always be on top / parallel to each other
    clearCanvas();
    camera.render([
        rotatingDisc1.base.aShape,
        platform1.physicalObject.aShape,
        rotatingDisc2.base.aShape
    ]);
    camera.render([
        rotatingDisc1.disc.aShape,
        jumpBar1.base.aShape,
        jumpBar2.base.aShape,
        rotatingDisc2.disc.aShape
    ]);
    camera.render([
        player.physicsObject.aShape,
        pendulumHammer1.support.aShape, pendulumHammer1.hammer.aShape,
        jumpBar1.bar.aShape,
        jumpBar2.bar.aShape
    ]);
    //check if player's y coordinate is < -400, if so then the player has fallen off the map
    if (player.physicsObject.cBody.position.y <= -400) {
        console.warn("Player died (y <= -400), respawning now...");
        player.physicsObject.cBody.position.set(0, 500, 0);
    }
}, 16);
