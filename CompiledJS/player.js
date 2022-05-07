"use strict";
class Player {
    constructor(world, camera) {
        //Constants
        this.speed = 10;
        this.jumpForce = 500;
        this.rotationSensitivity = 0.1;
        this.inAir = false;
        this.physicsObject = new PhysicsObject(world, new Box(100, 200, 100), new CANNON.Body({ mass: 1, material: new CANNON.Material() }));
        this.physicsObject.aShape.showOutline();
        this.physicsObject.cBody.material.friction = 0.2;
        this.physicsObject.cBody.linearDamping = 0.31;
        this.physicsObject.cBody.angularDamping = 1;
        this.collisionListener();
        this.thirdPersonCamera(camera);
    }
    //Methods
    moveLocal(vector) {
        //need to multiply this vector by the player's rotation
        const absoluteMovement = multiplyQuaternionVector({ x: this.physicsObject.cBody.quaternion.x, y: this.physicsObject.cBody.quaternion.y, z: this.physicsObject.cBody.quaternion.z, w: this.physicsObject.cBody.quaternion.w }, vector);
        this.physicsObject.cBody.position.x += absoluteMovement.x;
        this.physicsObject.cBody.position.z += absoluteMovement.z;
    }
    jump(jumpForce) {
        if (this.inAir == false) {
            this.physicsObject.cBody.applyImpulse(new CANNON.Vec3(0, jumpForce, 0), this.physicsObject.cBody.position);
            this.inAir = true;
        }
    }
    collisionListener() {
        //check if the player is currently colliding with a surface, and not in a jump
        this.physicsObject.cBody.addEventListener('collide', ($e) => {
            if ($e.contact.bj.id == -1) { //all ground elements should have id = -1;
                this.inAir = false;
            }
        });
    }
    thirdPersonCamera(camera) {
        document.body.addEventListener('mousemove', ($e) => {
            const yRotationQuaternion = eulerToQuaternion(Euler(0, $e.movementX * this.rotationSensitivity, 0));
            const currentRotationQuaternion = { x: player.physicsObject.cBody.quaternion.x, y: player.physicsObject.cBody.quaternion.y, z: player.physicsObject.cBody.quaternion.z, w: player.physicsObject.cBody.quaternion.w };
            const resultQuaternion = multiplyQuaternions(currentRotationQuaternion, yRotationQuaternion);
            player.physicsObject.cBody.quaternion.set(resultQuaternion.x, resultQuaternion.y, resultQuaternion.z, resultQuaternion.w);
            camera.rotation.y += $e.movementX * this.rotationSensitivity; //cant sync camera's rotation since we don't have access to the player's y rotation, only quaternion
            camera.updateRotationMatrix();
        });
    }
    syncCameraPosition(camera, cameraOffset) {
        const playerCameraVector = JSON.parse(JSON.stringify(cameraOffset));
        const inverseQuaternion = JSON.parse(JSON.stringify(this.physicsObject.aShape.quaternion));
        inverseQuaternion.w *= 1; //invert by multiplying w by -1
        const cameraPosition = multiplyQuaternionVector(inverseQuaternion, playerCameraVector);
        cameraPosition.x += this.physicsObject.cBody.position.x;
        cameraPosition.z += this.physicsObject.cBody.position.z;
        camera.position = cameraPosition;
    }
}
