//Handles the data flow from Client to Server (firebase)

const uploadPlayer = () => {
    const playerData = { //creating data object to send to firebase
        position: {
                x: GAME_CONFIG.player!.physicsObject.cBody.position.x,
                y: GAME_CONFIG.player!.physicsObject.cBody.position.y,
                z: GAME_CONFIG.player!.physicsObject.cBody.position.z,
        },
        quaternion: {
            x: GAME_CONFIG.player!.physicsObject.cBody.quaternion.x,
            y: GAME_CONFIG.player!.physicsObject.cBody.quaternion.y,
            z: GAME_CONFIG.player!.physicsObject.cBody.quaternion.z,
            w: GAME_CONFIG.player!.physicsObject.cBody.quaternion.z
        },
        playerID: GAME_CONFIG.player!.playerID
    };

    const levelIndex = CURRENT_LEVEL_INDEX; //save the playerData at path: "levels/{levelIndex}", so that players on the same level will be in the same lobby

}