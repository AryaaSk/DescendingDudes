"use strict";
//Handles the data flow from Client to Server (firebase)
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
const firebaseWrite = (path, data) => {
    const ref = firebase.database().ref(path);
    ref.set(data);
};
const firebaseRead = (path) => {
    const promise = new Promise((resolve) => {
        const ref = firebase.database().ref(path);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            resolve(data);
        });
    });
    return promise;
};
const UPLOAD_PLAYER_DATA = () => {
    const msSince1970 = Date.now();
    const playerData = {
        position: {
            x: Math.round(GAME_CONFIG.player.physicsObject.cBody.position.x),
            y: Math.round(GAME_CONFIG.player.physicsObject.cBody.position.y),
            z: Math.round(GAME_CONFIG.player.physicsObject.cBody.position.z),
        },
        quaternion: {
            x: GAME_CONFIG.player.physicsObject.cBody.quaternion.x,
            y: GAME_CONFIG.player.physicsObject.cBody.quaternion.y,
            z: GAME_CONFIG.player.physicsObject.cBody.quaternion.z,
            w: GAME_CONFIG.player.physicsObject.cBody.quaternion.z
        },
        playerID: GAME_CONFIG.player.playerID,
        lastUpdated: msSince1970 //used when clearing players
    };
    firebaseWrite(`levels/${CURRENT_LEVEL_INDEX}/${GAME_CONFIG.player.playerID}`, playerData); //save the playerData at path: "levels/{levelIndex}", so that players on the same level will be in the same lobby
};
