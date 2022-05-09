"use strict";
class Obstacle {
    constructor() {
        this.position = Vector(0, 0, 0);
        if (GameConfig.world == undefined) {
            console.error("Cannot add obstacle, please pass a CANNON World to the GameConfig");
            return;
        }
    }
    update() { } //code is inside individual subclasses
}
class Platform extends Obstacle {
    constructor(dimensions, position, options) {
        super();
        this.width = dimensions.width;
        this.depth = dimensions.depth;
        this.position = position;
        const thickness = (dimensions.thickness == undefined) ? Platform.thickness : dimensions.thickness;
        const aShape = new Box(this.width, thickness, this.depth);
        this.physicalObject = new PhysicsObject(GameConfig.world, aShape, new CANNON.Body({ mass: 0 }));
        this.physicalObject.cBody.position.set(this.position.x, this.position.y, this.position.z);
        this.physicalObject.cBody.id = -1; //so that player can recognise and reset jump
        const objectColour = ((options === null || options === void 0 ? void 0 : options.colour) == undefined) ? Platform.defaultColour : options === null || options === void 0 ? void 0 : options.colour;
        this.physicalObject.aShape.setColour(objectColour);
        this.physicalObject.aShape.showOutline();
    }
    update() {
        this.physicalObject.syncAShape();
    }
}
Platform.thickness = 10;
Platform.defaultColour = "#ffff00";
class BouncyPlatform extends Platform {
    constructor(dimensions, position, options) {
        super(dimensions, position, options);
        const restituion = ((options === null || options === void 0 ? void 0 : options.resitution) == undefined) ? BouncyPlatform.defaultResitution : options.resitution;
        this.physicalObject.cBody.material = new CANNON.Material();
        const contactMaterial = new CANNON.ContactMaterial(GameConfig.player.physicsObject.cBody.material, this.physicalObject.cBody.material, { restitution: restituion });
        GameConfig.world.addContactMaterial(contactMaterial);
    }
}
BouncyPlatform.defaultResitution = 1.5;
class MovingPlatform extends Platform {
    constructor(dimensions, position, options) {
        super(dimensions, position.position1, options);
        this.direction = 1; //1 = towards position2, -1 = towards position1
        this.speed = ((options === null || options === void 0 ? void 0 : options.speed) == undefined) ? MovingPlatform.defaultSpeed : (1 / options.speed) * 100;
        this.position1 = position.position1;
        this.position2 = position.position2;
        this.accuracy = ((options === null || options === void 0 ? void 0 : options.accuracy) == undefined) ? MovingPlatform.defaultAccuracy : (options.accuracy);
        const pos1pos2Vector = Vector(this.position2.x - this.position1.x, this.position2.y - this.position1.y, this.position2.z - this.position1.z);
        const [interpolationX, interpolationY, interpolationZ] = [pos1pos2Vector.x / this.speed, pos1pos2Vector.y / this.speed, pos1pos2Vector.z / this.speed];
        this.movementVector = Vector(interpolationX, interpolationY, interpolationZ);
        this.physicalObject.cBody.mass = 1;
    }
    update() {
        //Use accuracy to normalize the positions, since they won't be exact, then set the platform's velocity in the vector multiplied by its direction
        const P1Normalized = Vector(Math.round(this.position1.x * this.accuracy), Math.round(this.position1.y * this.accuracy), Math.round(this.position1.z * this.accuracy));
        const P2Normalized = Vector(Math.round(this.position2.x * this.accuracy), Math.round(this.position2.y * this.accuracy), Math.round(this.position2.z * this.accuracy));
        const currentPNormlized = Vector(Math.round(this.physicalObject.cBody.position.x * this.accuracy), Math.round(this.physicalObject.cBody.position.y * this.accuracy), Math.round(this.physicalObject.cBody.position.z * this.accuracy));
        const isAtPosition1 = (currentPNormlized.x == P1Normalized.x && currentPNormlized.y == P1Normalized.y && currentPNormlized.z == P1Normalized.z);
        const isAtPosition2 = (currentPNormlized.x == P2Normalized.x && currentPNormlized.y == P2Normalized.y && currentPNormlized.z == P2Normalized.z);
        if (isAtPosition1 == true) {
            this.direction = 1;
        }
        else if (isAtPosition2 == true) {
            this.direction = -1;
        }
        const movementVector = Vector(this.movementVector.x * this.direction, this.movementVector.y * this.direction, this.movementVector.z * this.direction);
        this.physicalObject.cBody.position.x += movementVector.x;
        this.physicalObject.cBody.position.y += movementVector.y;
        this.physicalObject.cBody.position.z += movementVector.z;
        this.physicalObject.syncAShape();
    }
}
MovingPlatform.defaultSpeed = (1 / 1) * 100;
MovingPlatform.defaultAccuracy = 1;
class RotatingDisc extends Obstacle {
    constructor(dimensions, position, options) {
        super();
        this.radius = dimensions.radius;
        this.position = position;
        //place a static platform as the base, and disc above it, then let disc fall onto base
        const baseAShape = new Cylinder(RotatingDisc.baseSize, RotatingDisc.thickness);
        const discAShape = new Cylinder(this.radius, RotatingDisc.thickness);
        baseAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position = JSON.parse(JSON.stringify(this.position));
        discAShape.position.y += RotatingDisc.thickness; //to make the disc fall onto the base
        this.base = new PhysicsObject(GameConfig.world, baseAShape, new CANNON.Body({ mass: 0, material: new CANNON.Material() })); //not actually a cylinder, just looks like it
        this.disc = new PhysicsObject(GameConfig.world, discAShape, new CANNON.Body({ mass: 10000, material: new CANNON.Material({ friction: 1 }), shape: new CANNON.Cylinder(this.radius, this.radius, RotatingDisc.thickness, 8) }));
        const rotationSpeed = ((options === null || options === void 0 ? void 0 : options.rotationSpeed) == undefined) ? RotatingDisc.defaultRotationSpeed : options === null || options === void 0 ? void 0 : options.rotationSpeed;
        this.disc.cBody.angularVelocity.set(0, rotationSpeed, 0);
        this.disc.cBody.id = -1; //user shouldn't be interacting with base so don't need to set it
        const discBodyContactMaterial = new CANNON.ContactMaterial(this.base.cBody.material, this.disc.cBody.material, { friction: 0 });
        GameConfig.world.addContactMaterial(discBodyContactMaterial);
        const objectColour = ((options === null || options === void 0 ? void 0 : options.colour) == undefined) ? RotatingDisc.defaultColour : options === null || options === void 0 ? void 0 : options.colour;
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
RotatingDisc.defaultColour = "#87deeb";
RotatingDisc.defaultRotationSpeed = 1;
RotatingDisc.thickness = 25;
RotatingDisc.baseSize = 100;
class PendulumHammer extends Obstacle {
    constructor(dimensions, position, options) {
        super();
        this.hammerRotationSpeed = PendulumHammer.defaultHammerRotationSpeed;
        this.height = dimensions.height;
        this.gap = dimensions.gap;
        this.hammerReach = dimensions.hammerReach;
        this.position = position;
        const support = constructObjectFromPrimatives([
            new PrimativeBox({ width: PendulumHammer.supportThickness, height: this.height, depth: PendulumHammer.supportThickness }, Vector(-(this.gap / 2) + (PendulumHammer.supportThickness / 2), 0, 0)),
            new PrimativeBox({ width: PendulumHammer.supportThickness, height: this.height, depth: PendulumHammer.supportThickness }, Vector((this.gap / 2) - (PendulumHammer.supportThickness / 2), 0, 0)),
            new PrimativeBox({ width: this.gap, height: PendulumHammer.supportBarHeight, depth: PendulumHammer.supportThickness }, Vector(0, (this.height / 2) + (PendulumHammer.supportBarHeight / 2), 0))
        ], 0);
        support.aShape.position = JSON.parse(JSON.stringify(this.position));
        support.aShape.position.y += this.height / 2;
        this.support = new PhysicsObject(GameConfig.world, support.aShape, support.cBody);
        const hammerSize = (dimensions.hammerSize == undefined) ? PendulumHammer.defaultHammerSize : dimensions.hammerSize;
        const hammer = constructObjectFromPrimatives([
            new PrimativeBox({ width: PendulumHammer.hammerThickness, height: this.hammerReach, depth: PendulumHammer.hammerThickness }, Vector(0, -(this.hammerReach / 2), 0)),
            new PrimativeBox({ width: hammerSize, height: hammerSize, depth: hammerSize * 1.5 }, Vector(0, -(this.hammerReach), 0))
        ], 0);
        hammer.aShape.position = JSON.parse(JSON.stringify(this.position));
        hammer.aShape.position.y += (this.height) + (PendulumHammer.supportBarHeight / 2); //want hammer to look like it is hanging from the support bar
        this.hammer = new PhysicsObject(GameConfig.world, hammer.aShape, hammer.cBody);
        this.support.cBody.material = new CANNON.Material({ friction: 0 });
        this.hammer.cBody.material = new CANNON.Material({ friction: 0 });
        const objectColour = ((options === null || options === void 0 ? void 0 : options.colour) == undefined) ? PendulumHammer.defaultColour : options === null || options === void 0 ? void 0 : options.colour;
        this.support.aShape.setColour(objectColour);
        this.hammer.aShape.setColour(objectColour);
        this.support.aShape.showOutline();
        this.hammer.aShape.showOutline();
        this.support.aShape.faces[2].colour = ""; //these faces will be hidden by the top support bar anyway
        this.support.aShape.faces[8].colour = "";
        this.hammerRotationSpeed = ((options === null || options === void 0 ? void 0 : options.rotationSpeed) == undefined) ? PendulumHammer.defaultHammerRotationSpeed : options === null || options === void 0 ? void 0 : options.rotationSpeed;
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
PendulumHammer.defaultHammerSize = 100;
PendulumHammer.defaultHammerRotationSpeed = 2;
PendulumHammer.supportThickness = 50;
PendulumHammer.supportBarHeight = 50;
PendulumHammer.hammerThickness = 50;
class JumpBar extends Obstacle {
    constructor(dimensions, position, options) {
        super();
        this.length = dimensions.length;
        this.position = position;
        const baseAShape = new Box(JumpBar.baseSize, JumpBar.baseHeight, JumpBar.baseSize);
        baseAShape.position = JSON.parse(JSON.stringify(this.position));
        const [barHeight, barDepth] = [(dimensions.height == undefined) ? JumpBar.defaultBarheight : dimensions.height, (dimensions.depth == undefined) ? JumpBar.defaultBarDepth : dimensions.depth];
        const bar = constructObjectFromPrimatives([
            new PrimativeBox({ width: this.length, height: barHeight, depth: barDepth }, Vector(0, 0, 0))
        ], 10000);
        bar.aShape.position = JSON.parse(JSON.stringify(this.position));
        bar.aShape.position.y += (JumpBar.baseHeight / 2) + (barHeight / 2);
        bar.cBody.material = new CANNON.Material({ friction: 0 });
        this.base = new PhysicsObject(GameConfig.world, baseAShape, new CANNON.Body({ mass: 0, material: new CANNON.Material({ friction: 1 }) }));
        this.bar = new PhysicsObject(GameConfig.world, bar.aShape, bar.cBody);
        const rotationSpeed = ((options === null || options === void 0 ? void 0 : options.rotationSpeed) == undefined) ? JumpBar.defaultRotationSpeed : options === null || options === void 0 ? void 0 : options.rotationSpeed;
        bar.cBody.angularVelocity.set(0, rotationSpeed, 0);
        const objectColour = ((options === null || options === void 0 ? void 0 : options.colour) == undefined) ? JumpBar.defaultColour : options === null || options === void 0 ? void 0 : options.colour;
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
JumpBar.defaultColour = "#00ff00";
JumpBar.defaultRotationSpeed = 1;
JumpBar.defaultBarheight = 40;
JumpBar.defaultBarDepth = 40;
JumpBar.baseSize = 50;
JumpBar.baseHeight = 10;
