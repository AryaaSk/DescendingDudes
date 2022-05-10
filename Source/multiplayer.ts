//Handles the data flow from Client to Server (firebase)

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
const firebaseRead = ( path: string ) => {
    const promise = new Promise( (resolve) => {
        const ref = firebase.database().ref(path);
        ref.on('value', (snapshot: any) => {
            const data = snapshot.val();
            resolve(data);
        });
    });
    return promise;
};

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
        //also need to add a date (in ms since 1970), for the clearing players process
    };

    const levelIndex = CURRENT_LEVEL_INDEX; //save the playerData at path: "levels/{levelIndex}", so that players on the same level will be in the same lobby

}