"use strict";
//Setup
//CannonJS Setup
const world = new CANNON.World();
world.gravity.set(0, -9.82 * 100, 0); // *100 to scale into the world
//Aryaa3D Setup
linkCanvas("renderingWindow");
const camera = new Camera();
camera.worldRotation = Euler(-20, 0, 0);
camera.updateRotationMatrix();
//GameHelper Setup
enableKeyListeners();
document.addEventListener('click', () => {
    document.body.requestPointerLock();
}, { once: true });
//Player
const player = new PhysicsObject(world, new Box(100, 200, 100), new CANNON.Body({ mass: 1, material: new CANNON.Material() }));
player.aShape.showOutline();
player.cBody.position.set(200, 300, 0);
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
const platform = new PhysicsObject(world, new Box(400, 10, 1000), new CANNON.Body({ mass: 0 }));
platform.aShape.setColour("ffff00");
platform.aShape.showOutline();
platform.cBody.position.set(0, 0, 1000);
//Rotating Hammer
//Thid Person Camera
const rotationSensitivity = 0.1;
document.body.onmousemove = ($e) => {
    const yRotationQuaternion = eulerToQuaternion(Euler(0, $e.movementX * rotationSensitivity, 0));
    const currentRotationQuaternion = { x: player.cBody.quaternion.x, y: player.cBody.quaternion.y, z: player.cBody.quaternion.z, w: player.cBody.quaternion.w };
    const resultQuaternion = multiplyQuaternions(currentRotationQuaternion, yRotationQuaternion);
    player.cBody.quaternion.set(resultQuaternion.x, resultQuaternion.y, resultQuaternion.z, resultQuaternion.w);
    camera.worldRotation.x -= $e.movementY * rotationSensitivity; //only rotating world and not player
    if (camera.worldRotation.x < -90) {
        camera.worldRotation.x = -90;
    } //limit rotation ourselves, since we disabled rotation in enableMovementControls()
    else if (camera.worldRotation.x > 0) {
        camera.worldRotation.x = 0;
    }
    camera.worldRotation.y -= $e.movementX * rotationSensitivity;
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
    camera.position = player.aShape.position;
    disc.cBody.position.x = 0;
    disc.cBody.position.z = 0;
    clearCanvas();
    camera.render([base.aShape, platform.aShape]); //different y-values, since we limited rotation, the items will always be on top / parallel to each other
    camera.render([disc.aShape]);
    camera.render([player.aShape]);
}, 16);
