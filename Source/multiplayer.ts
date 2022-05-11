//Handles the data flow from Client to Server (firebase), as well as rendering the other players

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

const uploadPlayerData = () => {
    const msSince1970 = Date.now();

    const playerData = { //creating data object to send to firebase
        position: {
                x: Math.round(GAME_CONFIG.player!.physicsObject.cBody.position.x),
                y: Math.round(GAME_CONFIG.player!.physicsObject.cBody.position.y),
                z: Math.round(GAME_CONFIG.player!.physicsObject.cBody.position.z),
        },
        quaternion: {
            x: GAME_CONFIG.player!.physicsObject.cBody.quaternion.x,
            y: GAME_CONFIG.player!.physicsObject.cBody.quaternion.y,
            z: GAME_CONFIG.player!.physicsObject.cBody.quaternion.z,
            w: GAME_CONFIG.player!.physicsObject.cBody.quaternion.w
        },
        playerID: GAME_CONFIG.player!.playerID,
        lastUpdated: msSince1970 //used when clearing players
    };

    firebaseWrite(`levels/${CURRENT_LEVEL_INDEX}/${GAME_CONFIG.player!.playerID}`, playerData) //save the playerData at path: "levels/{levelIndex}", so that players on the same level will be in the same lobby
}

let currentLevelPlayers: { [k: string] : OtherPlayer } = {};
let OTHER_PLAYERS_A_SHAPES: Shape[] = [];
const syncOtherPlayers = () => {
    const ref = firebase.database().ref(`levels/${CURRENT_LEVEL_INDEX}`);

    ref.on('value', (snapshot: any) => {
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

const clearInactivePlayers = () => {
    //go through the players in the current level, if your (msSince1970) - their (msSince1970) is > 10000, then remove them
    const msSince1970 = Date.now();
    const deletePlayerIDs: string[] = [];

    const ref = firebase.database().ref(`levels/${CURRENT_LEVEL_INDEX}`);
    ref.once('value').then((snapshot: any) => {
        const levelData = snapshot.val();
        
        for (const playerID in levelData) {
            if (playerID == GAME_CONFIG.player!.playerID) { continue; }

            const playerData = levelData[playerID];
            const playerMsSince1970 = playerData.lastUpdated;
            const difference = msSince1970 - playerMsSince1970;

            if (difference > 10000) { //1 minute
                deletePlayerIDs.push(playerID);
            }
        }

        for (const playerID of deletePlayerIDs) {
            const ref = firebase.database().ref(`levels/${CURRENT_LEVEL_INDEX}/${playerID}`);
            ref.remove();
        }
    });
}