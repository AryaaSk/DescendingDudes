//Keysdown detection
//Using onkeydown() will cause a delay, now you can just access the keysDown array, and handle it in the animation loop
const keysDown: string[] = [];
const enableKeyListeners = () => {
    document.addEventListener('keydown', ($e) => {
        const key = $e.key.toLowerCase();
        if (keysDown.includes(key) == false) { keysDown.push(key); }
    })
    document.addEventListener('keyup', ($e) => {
        const key = $e.key.toLowerCase();
        if (keysDown.includes(key) == true) { keysDown.splice(keysDown.indexOf(key), 1); }
    })
}

const syncCamera = (camera: Camera, object: Shape) => { //Syncs camera to third person view, directly behind object
    const objectPosition: { x: number, y: number, z: number }  = JSON.parse(JSON.stringify(object.position));
    camera.position = objectPosition;

    const objectYRotation = -object.rotation.y; //need to update camera to use quaternions later
    camera.worldRotation.y = -objectYRotation;
    camera.updateRotationMatrix();
}






//CannonJS Physics Functions, import cannonjs before using any of these
const syncShape = (cannonBody: CANNON.Body, aryaa3DBody: Shape) => {
    aryaa3DBody.position.x = cannonBody.position.x;
    aryaa3DBody.position.y = cannonBody.position.y;
    aryaa3DBody.position.z = cannonBody.position.z;

    //to get rotation, we need to convert the quaternion, into XYZ Euler angles
    aryaa3DBody.quaternion = { x: cannonBody.quaternion.x, y: cannonBody.quaternion.y, z: cannonBody.quaternion.z, w: cannonBody.quaternion.w };
    aryaa3DBody.updateMatrices();
}

const createCANNONBoundingBox = (aShape: Shape): CANNON.Box => {
    //create a box object using the range of x, y, and z axis
    let [minX, minY, minZ] = [9999, 9999, 9999];
    let [maxX, maxY, maxZ] = [0, 0, 0];

    const pointMatrixScaled = aShape.pointMatrix.scaledUp(aShape.scale);
    for (let i = 0; i != pointMatrixScaled.width; i += 1) { 
        const point = pointMatrixScaled.getColumn(i);

        if (point[0] < minX) { minX = point[0]; }
        else if (point[0] > maxX) { maxX = point[0]; }

        if (point[1] < minY) { minY = point[1]; }
        else if (point[1] > maxY) { maxY = point[1]; }

        if (point[2] < minZ) { minZ = point[2]; }
        else if (point[2] > maxZ) { maxZ = point[2]; }
    }

    const [xRange, yRange, zRange] = [maxX - minX, maxY - minY, maxZ - minZ];
    let [halfWidth, halfHeight, halfDepth] = [xRange / 2, yRange / 2, zRange / 2];
    if (halfWidth == 0) { halfWidth = 1; } //to prevent other objects from not colliding with them
    if (halfHeight == 0) { halfHeight = 1; }
    if (halfDepth == 0) { halfDepth = 1; }

    const boundingBox = new CANNON.Box( new CANNON.Vec3(halfWidth, halfHeight, halfDepth) );
    return boundingBox
}


//Primatives, used for creating custom hitboxes
class Primative {
    dimensions: any;
    type: string = "";
    offset: XYZ = Vector(0, 0, 0);
    rotation: XYZ = { x: 0, y: 0, z: 0 };
}
class PrimativeBox extends Primative {
    dimensions: { width: number, height: number, depth: number };
    constructor(dimensions: { width: number, height: number, depth: number }, offset: XYZ, rotation?: XYZ) {
        super();
        this.type = "box";
        this.dimensions = dimensions;
        this.offset = offset;
        if (rotation != undefined) { this.rotation = rotation; }
    }
}
class PrimativeSphere extends Primative {
    dimensions: { radius: number };
    constructor(dimensions: { radius: number }, offset: XYZ, rotation?: XYZ) {
        super();
        this.type = "sphere";
        this.dimensions = dimensions;
        this.offset = offset;
        if (rotation != undefined) { this.rotation = rotation; }
    }
}
class PrimativeCylinder extends Primative { //In original cannonjs, the cylinder actually starts horizontally, so I copied the changes from Cannon-es here: https://github.com/pmndrs/cannon-es/pull/30/commits/3767192096ff0207f79352f0f90e16c01de7426f
    dimensions: { radius: number, height: number };
    constructor(dimensions: { radius: number, height: number }, offset: XYZ, rotation?: XYZ) {
        super();
        this.type = "cylinder";
        this.dimensions = dimensions;
        this.offset = offset;
        if (rotation != undefined) { this.rotation = rotation; }
    }
}
class PrimativeCone extends Primative {
    dimensions: { radius: number, height: number };
    constructor(dimensions: { radius: number, height: number }, offset: XYZ, rotation?: XYZ) {
        super();
        this.type = "cone";
        this.dimensions = dimensions;
        this.offset = offset;
        if (rotation != undefined) { this.rotation = rotation; }
    }
}


const constructObjectFromPrimatives = (primatives: Primative[], mass: number) => {
    //takes in aryaa3D shapes (must be a primative, e.g. box, sphere, cylinder, cone)
    let shape = new Shape();
    const body = new CANNON.Body( { mass: mass } );

    for (const primative of primatives) {
        const dimensions = primative.dimensions;
        const offset = primative.offset;

        let aShape = new Shape();
        let cShape = new CANNON.Shape();
        if (primative.type == "box") {
            aShape = new Box( dimensions.width, dimensions.height, dimensions.depth );
            cShape = new CANNON.Box( new CANNON.Vec3( dimensions.width / 2, dimensions.height / 2, dimensions.depth / 2 ) );
        }
        else if (primative.type == "sphere") {
            aShape = new Sphere( dimensions.radius );
            cShape = new CANNON.Sphere( dimensions.radius );
        }
        else if (primative.type == "cylinder") {
            aShape = new Cylinder( dimensions.radius, dimensions.height );
            cShape = new CANNON.Cylinder( dimensions.radius, dimensions.radius, dimensions.height, 30 );
        }
        else if (primative.type == "cone") {
            aShape = new Cone( dimensions.radius, dimensions.height );
            cShape = new CANNON.Cylinder( 10, dimensions.radius, dimensions.height, 30 );
        }

        aShape.rotation = primative.rotation;
        aShape.updateQuaternion();
        aShape.physicalMatrix.translateMatrix(offset.x, offset.y, offset.z); //can't use position since that is only applied when the shape is rendered
        shape = mergeShapes(shape, aShape);

        body.addShape(cShape, new CANNON.Vec3(offset.x, offset.y, offset.z), new CANNON.Quaternion( aShape.quaternion.x, aShape.quaternion.y, aShape.quaternion.z, aShape.quaternion.w ) );
    }

    return { aShape: shape, cBody: body };
}


class PhysicsObject {
    aShape: Shape = new Shape(); //aryaa3D Shape
    cBody: CANNON.Body = new CANNON.Body(); //cannonJS body

    constructor (world: CANNON.World, aryaa3DShape: Shape, cannonJSBody?: CANNON.Body) {
        this.aShape = aryaa3DShape;

        if (cannonJSBody == undefined) {
            const cBody = new CANNON.Body( { mass: 1 } );
            this.cBody = cBody;
        } 
        else { this.cBody = cannonJSBody; }

        if (this.cBody.shapes.length == 0) {   
            const boundingBox = createCANNONBoundingBox(this.aShape);
            this.cBody.addShape(boundingBox);
        }

        this.syncCBody();
        world.addBody(this.cBody);
    }

    syncAShape() {
        syncShape(this.cBody, this.aShape);
    }
    syncCBody() {
        this.cBody.position = new CANNON.Vec3( this.aShape.position.x, this.aShape.position.y, this.aShape.position.z );

        this.cBody.quaternion.x = this.aShape.quaternion.x; //sync object's rotations
        this.cBody.quaternion.y = this.aShape.quaternion.y;
        this.cBody.quaternion.z = this.aShape.quaternion.z;
        this.cBody.quaternion.w = this.aShape.quaternion.w;
    }
}