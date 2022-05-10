class Player {
    physicsObject: PhysicsObject;

    //Constants
    speed: number = 10;
    jumpForce: number = 500;
    rotationSensitivity = 0.1;
    mobileRotationSensitivity = 0.5;

    constructor ( world: CANNON.World, camera: PerspectiveCamera ) {
        this.physicsObject = new PhysicsObject( world, new Box(100, 200, 100), new CANNON.Body( { mass: 1, material: new CANNON.Material() } ) )
        this.physicsObject.aShape.setColour("#ffffff80");
        this.physicsObject.aShape.showOutline();
        this.physicsObject.cBody.material.friction = 0.2;
        this.physicsObject.cBody.linearDamping = 0.31;
        this.physicsObject.cBody.angularDamping = 1;

        this.collisionListener();
        this.thirdPersonCamera( camera );
    }

    //Methods
    moveLocal( vector: XYZ ) {
        //need to multiply this vector by the player's rotation
        const absoluteMovement = multiplyQuaternionVector( { x: this.physicsObject.cBody.quaternion.x, y: this.physicsObject.cBody.quaternion.y, z: this.physicsObject.cBody.quaternion.z, w: this.physicsObject.cBody.quaternion.w }, vector );
        this.physicsObject.cBody.position.x += absoluteMovement.x;
        this.physicsObject.cBody.position.z += absoluteMovement.z;
    }

    inAir = false;
    jump( jumpForce: number ) {
        if (this.inAir == false) {
            this.physicsObject.cBody.applyImpulse( new CANNON.Vec3( 0, jumpForce, 0 ), this.physicsObject.cBody.position );
            this.inAir = true;
        }
    }
    private collisionListener() {
        //check if the player is currently colliding with a surface, and not in a jump
        this.physicsObject.cBody.addEventListener( 'collide', ($e: CANNON.ICollisionEvent) => {
            if ($e.contact.bj.id == -1) { //all ground elements should have id = -1;
                this.inAir = false;
            }
        })
    }

    update( camera: PerspectiveCamera ) {
        this.physicsObject.syncAShape();
        this.syncCameraPosition( camera );
    }
    thirdPersonCamera( camera: PerspectiveCamera ) { //Third Person Camera
        const rotatePlayerCameraY = (angle: number) => {
            const yRotationQuaternion = eulerToQuaternion( Euler( 0, angle, 0 ) );
            const currentRotationQuaternion = { x: this.physicsObject.cBody.quaternion.x, y: this.physicsObject.cBody.quaternion.y, z: this.physicsObject.cBody.quaternion.z, w: this.physicsObject.cBody.quaternion.w };
            const resultQuaternion = multiplyQuaternions( currentRotationQuaternion, yRotationQuaternion );
            this.physicsObject.cBody.quaternion.set( resultQuaternion.x, resultQuaternion.y, resultQuaternion.z, resultQuaternion.w );
        
            camera.rotation.y += angle; //cant sync camera's rotation since we don't have access to the player's y rotation, only quaternion
        }
        const rotateCameraX = (angle: number) => {
            const [lowerBound, upperBound] = [ 90, -5 ];
            camera.rotation.x += angle;
            if (camera.rotation.x > lowerBound) { camera.rotation.x = lowerBound; }
            if (camera.rotation.x < upperBound) { camera.rotation.x = upperBound; }
        }

        //Not using event listeners since they stack up whenever a new player object is created
        if (isMobile == false) {
            document.body.onmousemove = ($e) => {
                const yAngle = $e.movementX * this.rotationSensitivity;
                rotatePlayerCameraY( yAngle );
                const xAngle = $e.movementY * this.rotationSensitivity;
                rotateCameraX( xAngle );
                camera.updateRotationMatrix();
            }
        }
        else {
            let [previousX, previousY] = [0, 0];
            document.getElementById("renderingWindow")!.ontouchstart = ($e) => {
                [previousX, previousY] = [$e.targetTouches[0].clientX, $e.targetTouches[0].clientY];
            }
            document.getElementById("renderingWindow")!.ontouchmove = ($e) => {
                const yAngle = ($e.targetTouches[0].clientX - previousX) * this.mobileRotationSensitivity;
                rotatePlayerCameraY(yAngle );
                const xAngle = ($e.targetTouches[0].clientY - previousY) * this.mobileRotationSensitivity;
                rotateCameraX( xAngle );
                camera.updateRotationMatrix();
                [previousX, previousY] = [$e.targetTouches[0].clientX, $e.targetTouches[0].clientY];
            }
        }
    }
    syncCameraPosition(camera: PerspectiveCamera) { //Sync Camera behind player, by rotating vector from player -> camera
        const playerCameraVector = JSON.parse(JSON.stringify( CAMERA_OFFSET ));
        const rotationQuaternion = eulerToQuaternion( Euler( camera.rotation.x, camera.rotation.y, 0 ) );
        const newPlayerCameraVector = multiplyQuaternionVector( rotationQuaternion, playerCameraVector );

        camera.position = newPlayerCameraVector;
        camera.position.x += this.physicsObject.cBody.position.x;
        camera.position.y += this.physicsObject.cBody.position.y;
        camera.position.z += this.physicsObject.cBody.position.z;
    }
}