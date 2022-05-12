# Descending Dudes

### Trying to create a clone of games such as Fall Guys and Stumble Guys using aryaa3D, with CannonJS for physics.

**URL: https://aryaask.github.io/DescendingDudes/Source**

### Controls
On PC/Desktop, the controls are just WASD to move and SPACE to jump. Use the mouse to rotate the player and camera around.

On mobile, the controls appear at the bottom of the screen, the joystick is to move, and the jump button is used to jump. Drag on the screen to rotate the player and camera around
*I am using [JoystickJS](https://github.com/bobboteck/JoyStick) for the joystick*

## Previews
Here are some previews

![Level 1 Preview](https://github.com/AryaaSk/DescendingDudes/blob/master/Previews/Level1.png?raw=true)

![Level 3 Preview](https://github.com/AryaaSk/DescendingDudes/blob/master/Previews/Level3.png?raw=true)

## How it works
### Obstacles
Obstacles are just groups of physicsObjects *(refer to aryaa3D physics docs for information)*, they come together and form a class. In the class's constructor I take in arguments such as the dimension, the position of the obstacle, and extra options such as colour.
You can create a new obstacle like this:

```javascript
const platform = new Platform( { width: 1000, depth: 1000 }, { x: 0, y: 0, z: 0 }, { colour: "#ffffff" } );
```

The base Obstacle class has an update() function, which is overwritten by the subclasses, and it called every frame to update the obstacle's state, e.g. its position or rotation.

### Level Building
The levels are hardcoded into the website, in the [level.ts](Source/levels.ts), and are created using the Level() class.\
They are stored in an array called **LEVELS**, however they are not stored as the actual object, but instead as a function which can be called and will return the level:
```javascript
LEVELS.push(() => {
    const level = new Level();
    //configure level
    return level;
});
```

This is done because of how the aryaa3D GameHelper adds PhysicsObjects into the CANNON world. Whenever you initalize a new PhysicsObject, a new rigid body gets added into the CANNON world, which means that we can't generate all our levels at intialization because then there would be multiple bodies from different levels all in a singular CANNON world. I need to reset the world everytime the user goes to a new level.

The level class has 6 attributes to customize:
1. **Obstacles**: This is an array of the obstacles which are in the level, which is used in the update() function to call the obstacle's individual update() functions.
2. **Layers**: There are the rendering layers, the order in which the obstacles are rendered in. Ther are 3 layers: bottom, middle and top, and you can select where to render each obstacle, since you may want 1 obstacle to always appear in front of another one. *The player is always rendered at the top level.*
3. **updateCallback()**: This is called every frame, and is used for extra functionality throughout the whole level, such as changing the player's respawn point based on the checkpoints it has reached. This should not be used to update the obstacle's aShapes since the updateAShapes() function already does that.
4. **spawnPoint**: An XYZ position, where the player should spawn.
5. **respawnPoint**: An XYZ position, where the player should respawn, can be changed throughout the level.
6. **finishZ**: A Z coordinate, which tells the level when the player has finished the level, since the levels are usually going forward, and therefore increasing the player's Z coordinate until they reach the finish line.

### Multiplayer
I used Firebase Realtime Database to add multiplayer functionality inside the game, each level is like a lobby, and you can see all other players inside the level at the same time (other players are green).

When you load the game for the first time, you are assigned a playerID which is a random number, almost statistically guaranteed to be unique, and then saved to local storage, everytime you open the website after this it is loaded from local storage.

Apart from the main game loop, there are also 2 other loops running, an uploadPlayerData() loop which runs every 50ms, and an updateLastOnline() loop which runs every 5000ms.

The player's position and quaternion is saved to a the path of **"levels/{levelIndex}/{playerID}"** in firebase, and the lastOnline is the **seconds since 1970**, saved in a different data location to avoid updating the actual player positions and rotations.
Everytime a player loads a new level, they check the lastOnline data, and check if there are any playerIDs which were last updated more than 10 seconds ago, if so then they try and remove them from the current level. This creates a system where inactive players are removed from levels automatically, however there is still a Reset Server button in case this system doesn't work properly.

Then I used firebase realtime listners, to listen for changes to other players positions and rotations, and then update them on the clients game.

![Multiplayer Preview](https://github.com/AryaaSk/DescendingDudes/blob/master/Previews/Multiplayer.png?raw=true)
*Other players are green to avoid confusion with the local player*

### Game loop
A funtion called loadLevels( levelIndex ), is used to load levels, inside of the function it resets the CANNON world, to remove the old rigid bodies and add the new ones, then runs the function at **LEVELS[levelIndex]**, and sets the return value to a function called **currentLevel**. 

The currentLevel variable is then used inside of the main gameLoop, which carries out these steps:
- **Update CANNON World and Level**
- **Sync aryaa3D Shapes, as well as the player's aryaa3D Shape** 
- **Render the actual level, using the currentLevel.renderLevel() function**
- **Check players coordinates**:\ Check if player's y coordinate is <= -400, if so then respawn, or if the player's z coordinate is >= currentLevel.finishZ, if so then progress onto next level.

*There are more processes, but this is the simplified loop*


## Possible Improvements:
- Implement delta time, on devices with lower average FPS, delta time is required to give them the same speed and movement as players on higher FPS
- Implement obstacle state based on secondsSince1970, since the epoch time is universal across all devices, this would be a good way of syncing obstacles to be the same across many different devices, which is required since otherwise one player could go through an obstacle at a certain point in time, whereas another player could not, because of their individual client obstacles.
- Change obstacle and object sorting order based on player's Z coordinate. Now if you look around the map/level as the player, some far away objects look weird because they are being rendered in front of their respective platforms, this is done so that when the player is near them, the platforms don't get rendered above, however it causes this unwanted side-effect. You could change the rendering order based on how far the player is from that certain set of obstacles. A good example of this is the swinging hammers in level 2, they appear to be in front of their platform when looked at from the spawn.