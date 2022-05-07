class Platform {
    static height: number = 10;
    static defaultColour: string = "#ffff00";

    width: number;
    depth: number;
    position: XYZ;

    physicalObject: PhysicsObject;

    constructor ( world: CANNON.World, dimensions: { width: number, depth: number }, position: XYZ, colour?: string ) {
        this.width = dimensions.width;
        this.depth = dimensions.depth;
        this.position = position;

        const aShape = new Box( this.width, Platform.height, this.depth );
        this.physicalObject = new PhysicsObject( world, aShape, new CANNON.Body( { mass: 0 } ) );
        this.physicalObject.cBody.position.set( this.position.x, this.position.y, this.position.z );
        this.physicalObject.cBody.id = -1; //so that player can recognise and reset jump

        const objectColour = ( colour == undefined ) ? Platform.defaultColour : colour;
        this.physicalObject.aShape.setColour(objectColour);
        this.physicalObject.aShape.showOutline();
    }

    update() {
        this.physicalObject.syncAShape();
    }
}

class RotatingDisc {
    static height: number = 25;
    static defaultColour: string = "#87deeb";

    radius: number;
    position: XYZ;

    base: PhysicsObject;
    disc: PhysicsObject;

    constructor ( world: CANNON.World, dimensions: { radius: number }, position: XYZ, colour?: string ) {
        this.radius = dimensions.radius;
        this.position = position;
        
        //place a static platform as the base, and disc above it, then let disc fall onto base
        const baseAShape = new Cylinder(100, RotatingDisc.height);
        const discAShape = new Cylinder(this.radius, RotatingDisc.height);
        baseAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position.y += 100; //to make the disc fall onto the base

        this.base = new PhysicsObject( world, baseAShape, new CANNON.Body( { mass: 0, material: new CANNON.Material() } )); //not actually a cylinder, just looks like it
        this.disc = new PhysicsObject( world, discAShape, new CANNON.Body( { mass: 10000, material: new CANNON.Material( { friction: 1 } ), shape: new CANNON.Cylinder(this.radius, this.radius, RotatingDisc.height, 8) } ) );
        this.disc.cBody.angularVelocity.set( 0, 1, 0 );
        this.disc.cBody.id = -1; //user shouldn't be interacting with base so don't need to set it

        const objectColour = ( colour == undefined ) ? RotatingDisc.defaultColour : colour;
        this.base.aShape.setColour(objectColour);
        this.disc.aShape.setColour(objectColour);

        this.base.aShape.showOutline();
        this.disc.aShape.showOutline();

        const discBodyContactMaterial = new CANNON.ContactMaterial( this.base.cBody.material, this.disc.cBody.material, { friction: 0 } );
        world.addContactMaterial(discBodyContactMaterial); 
    }

    update() {
        this.base.syncAShape();
        this.disc.cBody.position.x = this.position.x; //Stop disc from falling off surface
        this.disc.cBody.position.z = this.position.z;
        this.disc.syncAShape();
    }
}