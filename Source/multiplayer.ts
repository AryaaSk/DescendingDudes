//Handles the data flow from Client to Server (firebase), as well as rendering the other players
let MULTIPLAYER_ENABLED = true;
declare const firebase: any;

//FIREBASE FUNCTIONS
const firebaseConfig = {
    apiKey: "AIzaSyANoLkbbB6zA67Y3PmaFl0JtdV3ajw4t4A",
    authDomain: "descendingdudes-6f182.firebaseapp.com",
    databaseURL: "https://descendingdudes-6f182-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "descendingdudes-6f182",
    storageBucket: "descendingdudes-6f182.appspot.com",
    messagingSenderId: "930788377725",
    appId: "1:930788377725:web:cee9fb951e83638e5fdd14"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const firebaseWrite = ( path: string, data: any ) => {
    const ref = firebase.database().ref(path);
    ref.set(data);
};






//Uploading and Download Player Data
const uploadPlayerData = () => {
    const roundNumber = (number: number) => { //rounds to nearest 0.001
        return Math.round(number * 1000) / 1000;
    }

    const playerData = { //creating data object to send to firebase
        position: {
                x: Math.round(GAME_CONFIG.player!.physicsObject.cBody.position.x),
                y: Math.round(GAME_CONFIG.player!.physicsObject.cBody.position.y),
                z: Math.round(GAME_CONFIG.player!.physicsObject.cBody.position.z),
        },
        quaternion: {
            x: roundNumber(GAME_CONFIG.player!.physicsObject.cBody.quaternion.x),
            y: roundNumber(GAME_CONFIG.player!.physicsObject.cBody.quaternion.y),
            z: roundNumber(GAME_CONFIG.player!.physicsObject.cBody.quaternion.z),
            w: roundNumber(GAME_CONFIG.player!.physicsObject.cBody.quaternion.w)
        },
        playerID: GAME_CONFIG.player!.playerID,
    };

    firebaseWrite(`levels/${CURRENT_LEVEL_INDEX}/${GAME_CONFIG.player!.playerID}`, playerData) //save the playerData at path: "levels/{levelIndex}", so that players on the same level will be in the same lobby
}

let ref: any; let listener: any;
let currentLevelPlayers: { [k: string] : OtherPlayer } = {};
let OTHER_PLAYERS_A_SHAPES: Shape[] = [];
const syncOtherPlayers = ( levelIndex: number ) => {
    currentLevelPlayers = {};
    try { ref.off("value", listener) } //try and remove the listener for the old level
    catch { }

    ref = firebase.database().ref(`levels/${levelIndex}`);
    listener = ref.on('value', (snapshot: any) => {
        const aShapes = [];
        const levelData = snapshot.val();

        for (const playerID in levelData) {
            if (playerID == GAME_CONFIG.player!.playerID) { continue; }
            const playerData = levelData[playerID];

            const position = playerData.position;
            const quaternion = playerData.quaternion;
            
            if ( currentLevelPlayers[playerID] == undefined ) { //when the player has not been created before, we just add it to the list
                const player = new OtherPlayer( GAME_CONFIG.world!, playerData.ID );
                currentLevelPlayers[playerID] = player;
            }
            else {
                currentLevelPlayers[playerID].physicsObject.cBody.position.set( position.x, position.y, position.z );
                currentLevelPlayers[playerID].physicsObject.cBody.quaternion.set( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
                currentLevelPlayers[playerID].update();
            }

            aShapes.push( currentLevelPlayers[playerID].physicsObject.aShape );
        }

        OTHER_PLAYERS_A_SHAPES = aShapes;
    });
}


//Updating and removing active/inactive players
const updateLastOnline = () => {
    const secondsSince1970 = Math.round(Date.now() / 1000);
    firebaseWrite(`currentPlayers/${GAME_CONFIG.player!.playerID}/lastOnline`, secondsSince1970);
}

const clearInactivePlayers = ( levelIndex: number ) => {
    //go through the currentPlayers directory in firebase, check if their lastOnline is > 10 seconds ago
    //if so then remove them from the current level so that they aren't interfering

    const promise = new Promise((resolve) => {
        const secondsSince1970 = Math.round(Date.now() / 1000);
        const deletePlayerIDs: string[] = [];

        const ref = firebase.database().ref(`currentPlayers`);
        ref.once('value').then((snapshot: any) => {
            const currentPlayersData = snapshot.val();
        
            for (const playerID in currentPlayersData) {
                if (playerID == GAME_CONFIG.player!.playerID) { continue; }

                const playerSecondsSince1970 = currentPlayersData[playerID].lastOnline;
                const difference = secondsSince1970 - playerSecondsSince1970;

                if (difference > 10) { //10 seconds
                    deletePlayerIDs.push(playerID);
                }
            }


            for (let i = 0; i != deletePlayerIDs.length; i += 1) {
                const playerID = deletePlayerIDs[i];
                const ref = firebase.database().ref(`levels/${levelIndex}/${playerID}`);
                ref.remove();
            }

            resolve("Removed inactive players");
        });
    })
    return promise;
}



const removePlayerID = ( levelIndex: number ) => {
    //removes the playerID from the level in firebase
    if (levelIndex == undefined) { return; }
    const ref = firebase.database().ref(`levels/${levelIndex}/${GAME_CONFIG.player!.playerID}`);
    ref.remove();
}
const resetServer = () => {
    const currentPlayersRef = firebase.database().ref("currentPlayers");
    const levelsRef = firebase.database().ref("levels");
    currentPlayersRef.remove();
    levelsRef.remove();
}