"use strict";
//Setup
//CannonJS Setup
const world = new CANNON.World();
world.gravity.set(0, -9.82 * 100, 0); // *100 to scale into the world
//Aryaa3D Setup
linkCanvas("renderingWindow");
const camera = new PerspectiveCamera();
const cameraOffset = Vector(0, 600, -1200);
camera.rotation.x = 20;
camera.updateRotationMatrix();
camera.nearDistance = 1000;
//GameHelper Setup
enableKeyListeners();
document.addEventListener('click', () => {
    document.body.requestPointerLock();
}, { once: false });
//Player
const player = new Player(world, camera);
player.physicsObject.cBody.position.set(0, 300, 2000);
//Obstacles
//Rotating Disc
const base = new PhysicsObject(world, new Cylinder(100, 25), new CANNON.Body({ mass: 0, material: new CANNON.Material() })); //not actually a cylinder, just looks like it
const disc = new PhysicsObject(world, new Cylinder(500, 25), new CANNON.Body({ mass: 10000, material: new CANNON.Material({ friction: 1 }), shape: new CANNON.Cylinder(400, 400, 25, 8) }));
base.aShape.setColour("orange");
disc.aShape.setColour("#87deeb");
disc.cBody.position.set(0, 100, 0);
disc.cBody.angularVelocity.set(0, 1, 0);
disc.cBody.id = -1;
const discBodyContactMaterial = new CANNON.ContactMaterial(base.cBody.material, disc.cBody.material, { friction: 0 });
world.addContactMaterial(discBodyContactMaterial);
//Platform
const platform = new PhysicsObject(world, new Box(400, 10, 3000), new CANNON.Body({ mass: 0 }));
platform.aShape.setColour("#ffff00");
platform.aShape.showOutline();
platform.cBody.position.set(0, 0, 1500);
platform.cBody.id = -1;
//Rotating Hammer
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
            //playerOnGround = false; //will handle validation later
            player.jump(player.jumpForce);
        }
    });
    player.moveLocal(pMovement);
    world.step(16 / 1000);
    //Sync aryaa3D Shapes
    player.physicsObject.syncAShape();
    player.syncCameraPosition(camera, cameraOffset);
    base.syncAShape();
    disc.syncAShape();
    platform.syncAShape();
    //Stop disc from falling off surface
    disc.cBody.position.x = 0;
    disc.cBody.position.z = 0;
    clearCanvas();
    camera.render([base.aShape, platform.aShape]); //different y-values, since we limited rotation, the items will always be on top / parallel to each other
    camera.render([disc.aShape]);
    camera.render([player.physicsObject.aShape]);
}, 16);
