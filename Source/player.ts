class Player {
    physicsObject: PhysicsObject;

    //Constants
    speed: number = 10;

    //Methods

    constructor (physicsObject: PhysicsObject) {
        this.physicsObject = physicsObject;
    }
}