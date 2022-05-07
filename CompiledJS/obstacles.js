"use strict";
const obstacleConfig = {
    world: undefined
};
class Obstacle {
    constructor() {
        this.position = Vector(0, 0, 0);
        if (obstacleConfig.world == undefined) {
            console.error("Cannot add obstacle, please pass a CANNON World to the obstacleConfig");
            return;
        }
    }
}
class Platform extends Obstacle {
    constructor(dimensions, position, colour) {
        super();
        this.width = dimensions.width;
        this.depth = dimensions.depth;
        this.position = position;
        const aShape = new Box(this.width, Platform.height, this.depth);
        this.physicalObject = new PhysicsObject(obstacleConfig.world, aShape, new CANNON.Body({ mass: 0 }));
        this.physicalObject.cBody.position.set(this.position.x, this.position.y, this.position.z);
        this.physicalObject.cBody.id = -1; //so that player can recognise and reset jump
        const objectColour = (colour == undefined) ? Platform.defaultColour : colour;
        this.physicalObject.aShape.setColour(objectColour);
        this.physicalObject.aShape.showOutline();
    }
    update() {
        this.physicalObject.syncAShape();
    }
}
Platform.height = 10;
Platform.defaultColour = "#ffff00";
class RotatingDisc extends Obstacle {
    constructor(dimensions, position, colour) {
        super();
        this.radius = dimensions.radius;
        this.position = position;
        //place a static platform as the base, and disc above it, then let disc fall onto base
        const baseAShape = new Cylinder(100, RotatingDisc.height);
        const discAShape = new Cylinder(this.radius, RotatingDisc.height);
        baseAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position.y += 100; //to make the disc fall onto the base
        this.base = new PhysicsObject(obstacleConfig.world, baseAShape, new CANNON.Body({ mass: 0, material: new CANNON.Material() })); //not actually a cylinder, just looks like it
        this.disc = new PhysicsObject(obstacleConfig.world, discAShape, new CANNON.Body({ mass: 10000, material: new CANNON.Material({ friction: 1 }), shape: new CANNON.Cylinder(this.radius, this.radius, RotatingDisc.height, 8) }));
        this.disc.cBody.angularVelocity.set(0, 1, 0);
        this.disc.cBody.id = -1; //user shouldn't be interacting with base so don't need to set it
        const discBodyContactMaterial = new CANNON.ContactMaterial(this.base.cBody.material, this.disc.cBody.material, { friction: 0 });
        world.addContactMaterial(discBodyContactMaterial);
        const objectColour = (colour == undefined) ? RotatingDisc.defaultColour : colour;
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
RotatingDisc.height = 25;
RotatingDisc.defaultColour = "#87deeb";
class PendulumHammer extends Obstacle {
    constructor(dimensions, position, colour) {
        super();
        this.hammerRotationSpeed = PendulumHammer.defaultHammerRotationSpeed;
        this.height = dimensions.height;
        this.gap = dimensions.gap;
        this.position = position;
        const support = constructObjectFromPrimatives([
            new PrimativeBox({ width: PendulumHammer.supportWidth, height: this.height, depth: PendulumHammer.supportDepth }, Vector(-(this.gap / 2) + (PendulumHammer.supportWidth / 2), 0, 0)),
            new PrimativeBox({ width: PendulumHammer.supportWidth, height: this.height, depth: PendulumHammer.supportDepth }, Vector((this.gap / 2) - (PendulumHammer.supportWidth / 2), 0, 0)),
            new PrimativeBox({ width: this.gap, height: PendulumHammer.supportBarHeight, depth: PendulumHammer.supportDepth }, Vector(0, this.height / 2, 0))
        ], 0);
        support.aShape.position = JSON.parse(JSON.stringify(this.position));
        support.aShape.position.y += this.height / 2;
        this.support = new PhysicsObject(obstacleConfig.world, support.aShape, support.cBody);
        const hammer = constructObjectFromPrimatives([
            new PrimativeBox({ width: PendulumHammer.hammerWidth, height: this.height / 2, depth: PendulumHammer.hammerDepth }, Vector(0, -(PendulumHammer.supportBarHeight / 2) - (this.height / 4) + (PendulumHammer.hammerWidth / 2), 0)),
            new PrimativeCylinder({ radius: PendulumHammer.hammerRadius, height: PendulumHammer.hammerLength }, Vector(0, -(this.height / 2) - (PendulumHammer.hammerRadius / 2), 0), Euler(90, 0, 0))
        ], 0);
        hammer.aShape.position = JSON.parse(JSON.stringify(this.position));
        hammer.aShape.position.y += (this.height) - (PendulumHammer.supportBarHeight * 0.25); //want hammer to look like it is hanging from the support bar
        this.hammer = new PhysicsObject(obstacleConfig.world, hammer.aShape, hammer.cBody);
        const objectColour = (colour == undefined) ? PendulumHammer.defaultColour : colour;
        this.support.aShape.setColour(objectColour);
        this.support.aShape.showOutline();
        this.hammer.aShape.setColour(objectColour);
        this.hammer.aShape.showOutline();
        this.support.aShape.faces[2].colour = ""; //these faces will be hidden by the top support bar anyway
        this.support.aShape.faces[8].colour = "";
    }
    update() {
        this.support.syncAShape();
        this.tickRotation();
    }
    tickRotation() {
        if (this.hammer.aShape.rotation.x >= 90) {
            this.hammerRotationSpeed *= -1;
        }
        if (this.hammer.aShape.rotation.x <= -90) {
            this.hammerRotationSpeed *= -1;
        }
        this.hammer.aShape.rotation.x += this.hammerRotationSpeed;
        this.hammer.aShape.updateQuaternion();
        this.hammer.syncCBody();
    }
}
PendulumHammer.defaultColour = "#ff00ff";
PendulumHammer.supportWidth = 50;
PendulumHammer.supportBarHeight = 50;
PendulumHammer.supportDepth = 50;
PendulumHammer.hammerWidth = 50;
PendulumHammer.hammerDepth = 50;
PendulumHammer.hammerRadius = 50;
PendulumHammer.hammerLength = 100;
PendulumHammer.defaultHammerRotationSpeed = 2;
