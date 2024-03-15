import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getRedirectResult, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, set, ref, update, push, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { generateDarkRoomCode, encrypt } from "./utils.js";
import { firebaseConfig } from './firebaseConfig.js'

initializeApp(firebaseConfig);

const auth = getAuth();
const db = getDatabase();

const user = getRedirectResult(auth).currentUser;

let isFocus = true

if (user) {
    window.location.href = "/dark_room.html"
} else {
    if (!isDarkRoomCodeInLocalStorage()) {
        const darkRoomCodeEnterButton = document.getElementById("darkRoomCodeEnterButton")
        darkRoomCodeEnterButton.addEventListener("click", handleDarkRoomCodeGiven)

        const darkRoomCodeInput = document.getElementById("darkRoomCodeInput")
        darkRoomCodeInput.addEventListener("keyup", (e) => { handleDarkRoomCodeInputKeypress(e) })

        darkRoomCodeInput.addEventListener("mouseover", () => { darkRoomCodeInput.style.backgroundColor = "black" })
        darkRoomCodeInput.addEventListener("focus", () => { 
            darkRoomCodeInput.style.backgroundColor = "black"
            isFocus = true 
        })

        darkRoomCodeInput.addEventListener("mouseout", () => { 
            if (!isFocus) {
                darkRoomCodeInput.style.backgroundColor = "white" 
            }
        })
        darkRoomCodeInput.addEventListener("blur", () => { 
            darkRoomCodeInput.style.backgroundColor = "white" 
            isFocus = false 
        })

        const createDarkRoomButton = document.getElementById("createDarkRoomButton")
        createDarkRoomButton.addEventListener("click", handleCreateDarkRoomButtonClick)
    }
}

function isDarkRoomCodeInLocalStorage() {
    const darkRoomCode = localStorage.getItem('darkRoomCode')

    if (darkRoomCode != null) {
        const encryptedDarkRoomCode = encrypt(darkRoomCode, darkRoomCode)

        signInWithEmailAndPassword(auth, encryptedDarkRoomCode + '@gmail.com', encryptedDarkRoomCode)
        .then (() => {
            localStorage.setItem('darkRoomCode', darkRoomCode);
            window.location.href = "/dark_room.html"
        })
        .catch((error) => {
            localStorage.removeItem('darkRoomCode');
        })

        return true
    }

    return false
}

function handleDarkRoomCodeInputKeypress(e) {
    console.log(e.target.value, ", ", e.key)
    if (darkRoomCodeInput.value == '') {
        darkRoomCodeEnterButton.style.opacity = 0
        darkRoomCodeEnterButton.style.marginRight = "-3.5em"
    } else {
        darkRoomCodeEnterButton.style.opacity = 1
        darkRoomCodeEnterButton.style.marginRight = "0"
    }

    if (e.key !== 'Enter') {
        return
    }

    handleDarkRoomCodeGiven()
}

function handleDarkRoomCodeGiven() {
    const encryptedDarkRoomCode = encrypt(darkRoomCodeInput.value, darkRoomCodeInput.value)

    signInWithEmailAndPassword(auth, encryptedDarkRoomCode + '@gmail.com', encryptedDarkRoomCode)
    .then (() => {
        localStorage.setItem('darkRoomCode', darkRoomCodeInput.value);

        window.location.href = "/dark_room.html"
    })
    .catch(() => {
        darkRoomCodeInput.style.backgroundColor = "red"

        setTimeout(() => {
            if (isFocus) {
                darkRoomCodeInput.style.backgroundColor = "black"
            } else {
                darkRoomCodeInput.style.backgroundColor = "white"
            }
        }, 2000)
    })
}

function handleCreateDarkRoomButtonClick() {
    const darkRoomCode = generateDarkRoomCode()
    const encryptedDarkRoomCode = encrypt(darkRoomCode, darkRoomCode)

    async function createDarkRoom() {
        try {
            await createUserWithEmailAndPassword(auth, encryptedDarkRoomCode + '@gmail.com', encryptedDarkRoomCode);
            
            const uid = auth.currentUser.uid;
            const newMessageKey = await push(child(ref(db), '/dark_rooms/' + uid + '/messages')).key;
            
            await set(ref(db, '/dark_rooms/' + uid + '/messages/' + newMessageKey), "Welcome to The Dark Room!");
    
            localStorage.setItem('darkRoomCode', darkRoomCode);
    
            window.location.href = "/dark_room.html";
        // The only expected error are dark room code collisions
        } catch (error) {
            // reiterate again until no dark room code collision
            createDarkRoom();
        }
    }
    
    createDarkRoom()
}