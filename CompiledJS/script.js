"use strict";
//Setup
//CannonJS Setup
const world = new CANNON.World();
world.gravity.set(0, -9.82 * 100, 0); // *100 to scale into the world
//Aryaa3D Setup
linkCanvas("renderingWindow");
const camera = new PerspectiveCamera();
const cameraOffset = Vector(0, 900, -1500);
camera.rotation.x = 20;
camera.updateRotationMatrix();
//GameHelper Setup
enableKeyListeners();
document.addEventListener('click', () => {
    document.body.requestPointerLock();
}, { once: true });
//Player
const player = new PhysicsObject(world, new Box(100, 200, 100), new CANNON.Body({ mass: 1, material: new CANNON.Material() }));
player.aShape.showOutline();
player.cBody.position.set(200, 300, 2000);
player.cBody.material.friction = 0.2;
player.cBody.linearDamping = 0.31;
player.cBody.angularDamping = 1;
/* //Will handle later, once I have added perspective in aryaa3D Source
let playerOnGround = true;
player.cBody.addEventListener('collide', ($e: any) => {
    console.log($e)
})
*/
//Obstacles
//Rotating Disc
const base = new PhysicsObject(world, new Cylinder(100, 25), new CANNON.Body({ mass: 0, material: new CANNON.Material() })); //not actually a cylinder, just looks like it
const disc = new PhysicsObject(world, new Cylinder(500, 25), new CANNON.Body({ mass: 10000, material: new CANNON.Material({ friction: 1 }), shape: new CANNON.Cylinder(400, 400, 25, 8) }));
base.aShape.setColour("orange");
disc.aShape.setColour("#87deeb");
disc.cBody.position.set(0, 100, 0);
disc.cBody.angularVelocity.set(0, 1, 0);
const discBodyContactMaterial = new CANNON.ContactMaterial(base.cBody.material, disc.cBody.material, { friction: 0 });
world.addContactMaterial(discBodyContactMaterial);
//Platform
const platform = new PhysicsObject(world, new Box(400, 10, 3000), new CANNON.Body({ mass: 0 }));
platform.aShape.setColour("#ffff00");
platform.aShape.showOutline();
platform.cBody.position.set(0, 0, 1500);
//Rotating Hammer
//Thid Person Camera
const rotationSensitivity = 0.1;
document.body.onmousemove = ($e) => {
    const yRotationQuaternion = eulerToQuaternion(Euler(0, $e.movementX * rotationSensitivity, 0));
    const currentRotationQuaternion = { x: player.cBody.quaternion.x, y: player.cBody.quaternion.y, z: player.cBody.quaternion.z, w: player.cBody.quaternion.w };
    const resultQuaternion = multiplyQuaternions(currentRotationQuaternion, yRotationQuaternion);
    player.cBody.quaternion.set(resultQuaternion.x, resultQuaternion.y, resultQuaternion.z, resultQuaternion.w);
    camera.rotation.y += $e.movementX * rotationSensitivity; //cant sync camera's rotation since we don't have access to the player's y rotation, only quaternion
    camera.updateRotationMatrix();
};
//ANIMATION LOOP
setInterval(() => {
    //Handle keysdown
    const pMovement = Vector(0, 0, 0);
    const speed = 10;
    const jumpHeight = 100;
    keysDown.forEach((key) => {
        if (key == "w") {
            pMovement.z += speed;
        }
        else if (key == "s") {
            pMovement.z -= speed;
        }
        else if (key == "a") {
            pMovement.x -= speed;
        }
        else if (key == "d") {
            pMovement.x += speed;
        }
        else if (key == " ") {
            //playerOnGround = false; //will handle validation later
            pMovement.y += jumpHeight;
        }
    });
    //need to multiply this vector by the player's rotation
    const absoluteMovement = multiplyQuaternionVector({ x: player.cBody.quaternion.x, y: player.cBody.quaternion.y, z: player.cBody.quaternion.z, w: player.cBody.quaternion.w }, pMovement);
    player.cBody.position.x += absoluteMovement.x;
    player.cBody.position.z += absoluteMovement.z;
    player.cBody.applyImpulse(new CANNON.Vec3(0, pMovement.y, 0), player.cBody.position);
    world.step(16 / 1000);
    //Sync aryaa3D Shapes
    player.syncAShape();
    base.syncAShape();
    disc.syncAShape();
    platform.syncAShape();
    //Sync Camera behind player, by rotating vector from player -> camera
    const playerCameraVector = JSON.parse(JSON.stringify(cameraOffset));
    const inverseQuaternion = JSON.parse(JSON.stringify(player.aShape.quaternion));
    inverseQuaternion.w *= 1;
    const cameraPosition = multiplyQuaternionVector(inverseQuaternion, playerCameraVector);
    cameraPosition.x += player.aShape.position.x;
    cameraPosition.z += player.aShape.position.z;
    camera.position = cameraPosition;
    //Stop disc from falling off surface
    disc.cBody.position.x = 0;
    disc.cBody.position.z = 0;
    clearCanvas();
    camera.render([base.aShape, platform.aShape]); //different y-values, since we limited rotation, the items will always be on top / parallel to each other
    camera.render([disc.aShape]);
    camera.render([player.aShape]);
}, 16);
