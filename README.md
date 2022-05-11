# Descending Dudes

### Trying to create a clone of games such as Fall Guys and Stumble Guys using aryaa3D, with CannonJS for physics.

URL: https://aryaask.github.io/DescendingDudes/Source

*Need to add description, how it works, and previews*

### Possible Improvements:
- Implement delta time, on devices with lower average FPS, delta time is required to give them the same speed and movement as players on higher FPS
- Implement obstacle state based on secondsSince1970, since the epoch time is universal across all devices, this would be a good way of syncing obstacles to be the same across many different devices, which is required since otherwise one player could go through an obstacle at a certain point in time, whereas another player could not, because of their individual client obstacles.
- Change obstacle and object sorting order based on player's Z coordinate. Now if you look around the map/level as the player, some far away objects look weird because they are being rendered in front of their respective platforms, this is done so that when the player is near them, the platforms don't get rendered above, however it causes this unwanted side-effect. You could change the rendering order based on how far the player is from that certain set of obstacles. A good example of this is the swinging hammers in level 2, they appear to be in front of their platform when looked at from the spawn.