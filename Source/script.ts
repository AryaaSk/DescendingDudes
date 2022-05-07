//Setup
//CannonJS Setup
const world = new CANNON.World();
world.gravity.set(0, -9.82 * 100, 0); // *100 to scale into the world

//Aryaa3D Setup
linkCanvas("renderingWindow")
const camera = new PerspectiveCamera();
camera.rotation.x = 20;
camera.updateRotationMatrix();
camera.nearDistance = 1000;

//GameHelper Setup
enableKeyListeners();

document.addEventListener('click', () => { //full screen mode
    document.body.requestPointerLock();
}, { once: false })



//Player
const player = new Player( world, camera);
player.physicsObject.cBody.position.set(0, 500, 0);





//Obstacles, ordered in order of appearance in the Level
const rotatingDisc1 = new RotatingDisc( world, { radius: 400 }, Vector(0, 0, 0));

const platform = new Platform( world, { width: 300, depth: 3000 }, Vector( 0, 0, 1500 ) );

const rotatingDisc2 = new RotatingDisc( world, { radius: 400 }, Vector(0, 0, 3000));




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


    world.step(16 / 1000);

    //Sync aryaa3D Shapes
    player.physicsObject.syncAShape();
    player.syncCameraPosition( camera, Vector( 0, 600, -1200 ) );

    rotatingDisc1.update();
    platform.update();
    rotatingDisc2.update();

    //different y-values, since we limited rotation, the items will always be on top / parallel to each other
    clearCanvas();
    camera.render([ //Bottom Layer (platforms)
        rotatingDisc1.base.aShape, 
        platform.physicalObject.aShape,
        rotatingDisc2.base.aShape
    ]);
    camera.render([ //Middle layer, for obstacles
        rotatingDisc1.disc.aShape,
        rotatingDisc2.disc.aShape
    ]);
    camera.render([ //Top layer, for rendering player
        player.physicsObject.aShape
    ]);
}, 16);