const obstacleConfig: {
    world?: CANNON.World
} = {
    world: undefined
};

class Obstacle { //When specifying obstacle's position, user should not need to take obstacle's height into consideration, it should translate y by +(height / 2) automatically.
    position: XYZ = Vector(0, 0, 0);

    constructor() {
        if (obstacleConfig.world == undefined) {
            console.error("Cannot add obstacle, please pass a CANNON World to the obstacleConfig");
            return;
        }
    }
}

class Platform extends Obstacle {
    static height: number = 10;
    static defaultColour: string = "#ffff00";

    width: number;
    depth: number;

    physicalObject: PhysicsObject;

    constructor ( dimensions: { width: number, depth: number }, position: XYZ, options?: { colour?: string } ) {
        super();
        this.width = dimensions.width;
        this.depth = dimensions.depth;
        this.position = position;

        const aShape = new Box( this.width, Platform.height, this.depth );
        this.physicalObject = new PhysicsObject( obstacleConfig.world!, aShape, new CANNON.Body( { mass: 0 } ) );
        this.physicalObject.cBody.position.set( this.position.x, this.position.y, this.position.z );
        this.physicalObject.cBody.id = -1; //so that player can recognise and reset jump

        const objectColour = ( options?.colour == undefined ) ? Platform.defaultColour : options?.colour;
        this.physicalObject.aShape.setColour(objectColour);
        this.physicalObject.aShape.showOutline();
    }

    update() {
        this.physicalObject.syncAShape();
    }
}

class RotatingDisc extends Obstacle {
    static defaultColour: string = "#87deeb";
    static defaultRotationSpeed: number = 1;
    static height: number = 25;
    static baseSize: number = 100;

    radius: number;

    base: PhysicsObject;
    disc: PhysicsObject;

    constructor ( dimensions: { radius: number }, position: XYZ, options?: { colour?: string, rotationSpeed?: number } ) {
        super();
        this.radius = dimensions.radius;
        this.position = position;
        
        //place a static platform as the base, and disc above it, then let disc fall onto base
        const baseAShape = new Cylinder(RotatingDisc.baseSize, RotatingDisc.height);
        const discAShape = new Cylinder(this.radius, RotatingDisc.height);
        baseAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position.y += RotatingDisc.height; //to make the disc fall onto the base

        this.base = new PhysicsObject( obstacleConfig.world!, baseAShape, new CANNON.Body( { mass: 0, material: new CANNON.Material() } )); //not actually a cylinder, just looks like it
        this.disc = new PhysicsObject( obstacleConfig.world!, discAShape, new CANNON.Body( { mass: 10000, material: new CANNON.Material( { friction: 1 } ), shape: new CANNON.Cylinder(this.radius, this.radius, RotatingDisc.height, 8) } ) );

        const rotationSpeed = ( options?.rotationSpeed == undefined ) ? RotatingDisc.defaultRotationSpeed : options?.rotationSpeed;
        this.disc.cBody.angularVelocity.set( 0, rotationSpeed, 0 );
        this.disc.cBody.id = -1; //user shouldn't be interacting with base so don't need to set it

        const discBodyContactMaterial = new CANNON.ContactMaterial( this.base.cBody.material, this.disc.cBody.material, { friction: 0 } );
        world.addContactMaterial(discBodyContactMaterial); 

        const objectColour = ( options?.colour == undefined ) ? RotatingDisc.defaultColour : options?.colour;
        this.base.aShape.setColour(objectColour);
        this.disc.aShape.setColour(objectColour);
        this.base.aShape.showOutline();
        this.disc.aShape.showOutline();
    }

    update() {
        this.base.syncAShape();
        this.disc.cBody.position.x = this.position.x; //Stop disc from falling off surface
        this.disc.cBody.position.z = this.position.z;
        this.disc.syncAShape();
    }
}

class PendulumHammer extends Obstacle {
    static defaultColour: string = "#ff00ff";
    static defaultHammerSize: number = 100;
    static defaultHammerRotationSpeed: number = 2;
    static supportThickness: number = 50;
    static supportBarHeight: number = 50;

    static hammerThickness: number = 50;

    height: number;
    gap: number;
    hammerReach: number;

    support: PhysicsObject;
    hammer: PhysicsObject;

    constructor ( dimensions: { height: number, gap: number, hammerReach: number, hammerSize?: number }, position: XYZ, options?: { colour?: string, rotationSpeed?: number } ) {
        super();
        this.height = dimensions.height;
        this.gap = dimensions.gap;
        this.hammerReach = dimensions.hammerReach;
        this.position = position;

        const support = constructObjectFromPrimatives( [
            new PrimativeBox( { width: PendulumHammer.supportThickness, height: this.height, depth: PendulumHammer.supportThickness }, Vector( -(this.gap / 2) + (PendulumHammer.supportThickness / 2), 0, 0 ) ),
            new PrimativeBox( { width: PendulumHammer.supportThickness, height: this.height, depth: PendulumHammer.supportThickness }, Vector( (this.gap / 2) - (PendulumHammer.supportThickness / 2), 0, 0 ) ),
            new PrimativeBox( { width: this.gap, height: PendulumHammer.supportBarHeight, depth: PendulumHammer.supportThickness }, Vector( 0, this.height / 2, 0 ))
        ], 0)
        support.aShape.position = JSON.parse(JSON.stringify(this.position));
        support.aShape.position.y += this.height / 2;
        this.support = new PhysicsObject( obstacleConfig.world!, support.aShape, support.cBody );

        const hammerSize = (dimensions.hammerSize == undefined) ? PendulumHammer.defaultHammerSize : dimensions.hammerSize;
        const hammer = constructObjectFromPrimatives( [
            new PrimativeBox( { width: PendulumHammer.hammerThickness, height: this.hammerReach, depth: PendulumHammer.hammerThickness }, Vector(0, -(PendulumHammer.supportBarHeight / 2) - (this.hammerReach / 2) + (PendulumHammer.hammerThickness / 2), 0) ),
            new PrimativeBox( { width: hammerSize, height: hammerSize, depth: hammerSize * 1.5 }, Vector( 0, -(this.hammerReach) - (hammerSize / 2), 0 ) )
        ], 0);
        hammer.aShape.position = JSON.parse(JSON.stringify(this.position));
        hammer.aShape.position.y += (this.height) - (PendulumHammer.supportBarHeight * 0.25); //want hammer to look like it is hanging from the support bar
        this.hammer = new PhysicsObject( obstacleConfig.world!, hammer.aShape, hammer.cBody );
        
        this.support.cBody.material = new CANNON.Material( { friction: 0 } );
        this.hammer.cBody.material = new CANNON.Material( { friction: 0 } );

        const objectColour = ( options?.colour == undefined ) ? PendulumHammer.defaultColour : options?.colour;
        this.support.aShape.setColour(objectColour);
        this.hammer.aShape.setColour(objectColour);
        this.support.aShape.showOutline();
        this.hammer.aShape.showOutline();
        this.support.aShape.faces[2].colour = ""; //these faces will be hidden by the top support bar anyway
        this.support.aShape.faces[8].colour = "";

        this.hammerRotationSpeed = (options?.rotationSpeed == undefined) ? PendulumHammer.defaultHammerRotationSpeed : options?.rotationSpeed;
    }
    

    update() {
        this.support.syncAShape();
        this.tickRotation();
    }

    private hammerRotationSpeed = PendulumHammer.defaultHammerRotationSpeed;
    tickRotation() { //unlike most physicalObjects, the hammer is controlled by the aShape to give it rigid rotations, which allows us to access the Euler rotations
        if (this.hammer.aShape.rotation.x >= 90) { this.hammerRotationSpeed *= -1; }
        if (this.hammer.aShape.rotation.x <= -90) { this.hammerRotationSpeed *= -1; }
        this.hammer.aShape.rotation.x += this.hammerRotationSpeed;
        this.hammer.aShape.updateQuaternion();
        this.hammer.syncCBody();
    }
}

class JumpBar extends Obstacle {
    static defaultColour: string = "#00ff00";
    static defaultRotationSpeed: number = 1;
    static baseSize: number = 50;
    static baseHeight: number = 10;
    static barThickness: number = 40;

    length: number;

    base: PhysicsObject;
    bar: PhysicsObject;

    constructor ( dimensions: { length: number }, position: XYZ, options?: { colour?: string, rotationSpeed?: number } ) {
        super();
        this.length = dimensions.length;
        this.position = position;
        
        const baseAShape = new Box( JumpBar.baseSize, JumpBar.baseHeight, JumpBar.baseSize );
        baseAShape.position = JSON.parse(JSON.stringify(this.position));
        const bar = constructObjectFromPrimatives([
            new PrimativeBox( { width: this.length, height: JumpBar.barThickness, depth: JumpBar.barThickness }, Vector(0, 0, 0 ) )
        ], 10000);
        bar.aShape.position = JSON.parse(JSON.stringify(this.position));
        bar.aShape.position.y += JumpBar.baseHeight + (JumpBar.barThickness / 2);
        bar.cBody.material = new CANNON.Material( { friction: 0 } );

        this.base = new PhysicsObject( obstacleConfig.world!, baseAShape, new CANNON.Body({ mass: 0, material: new CANNON.Material( { friction: 1 } )}) );
        this.bar = new PhysicsObject( obstacleConfig.world!, bar.aShape, bar.cBody );

        const rotationSpeed = (options?.rotationSpeed == undefined) ? JumpBar.defaultRotationSpeed : options?.rotationSpeed;
        bar.cBody.angularVelocity.set( 0, rotationSpeed, 0 );

        const objectColour = ( options?.colour == undefined ) ? JumpBar.defaultColour : options?.colour;
        this.base.aShape.setColour(objectColour);
        this.bar.aShape.setColour(objectColour);
        this.base.aShape.showOutline();
        this.bar.aShape.showOutline();
    }

    update() {
        this.base.syncAShape();
        this.bar.cBody.position.x = this.position.x; //Stop bar from falling off surface
        this.bar.cBody.position.z = this.position.z;
        this.bar.syncAShape();
    }
}