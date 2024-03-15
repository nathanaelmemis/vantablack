import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, onValue, ref, update, push, child, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { encrypt, decrypt } from "./utils.js";
import { firebaseConfig } from './firebaseConfig.js'

initializeApp(firebaseConfig);

const auth = getAuth();
const db = getDatabase();
let uid = null
const darkRoomCode = localStorage.getItem('darkRoomCode');

const WELCOME_MESSAGE = "Welcome to The Dark Room!"

const messsagesDivElement = document.getElementById("messages");
const messagesContainerElement = document.getElementById("messagesContainer")

onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid

        onValue(ref(db, '/dark_rooms/' + uid), (snapshot) => {
            const data = snapshot.val();

            // data should only be null when dark room is destroyed
            if (data == null) {
                setTimeout(() => {
                    auth.signOut()
                }, 2000)
            }

            const messages = data.messages;

            let combinedMessages = ''
            for(const index in messages) {
                const message = messages[index] == WELCOME_MESSAGE ? WELCOME_MESSAGE : decrypt(messages[index], darkRoomCode)

                console.log(message)

                combinedMessages += 
                    "<p>" +
                        message  +
                    "</p>";
            }

            messsagesDivElement.innerHTML = combinedMessages

            messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight
        });
    } else {
        window.location.href = "/the_dark_room/"
    }
});

const darkRoomCodeDisplayElement = document.getElementById("darkRoomCodeDisplay") 
darkRoomCodeDisplayElement.innerText = "Dark Room Code: " + darkRoomCode

darkRoomCodeDisplayElement.addEventListener("click", function() {
    navigator.clipboard.writeText(darkRoomCode)
})

const messageTextareaElement = document.getElementById("messageTextarea")
const messageTextareaWrapperElement = document.getElementById("messageTextareaWrapper")
messageTextareaElement.addEventListener("keyup", function(e) {
    if (e.key !== 'Enter' || e.shiftKey) {
        const numLine = messageTextareaElement.value.split('\n').length

        if (numLine > 7) {
            return
        }

        messageTextareaElement.style.height = (numLine + (numLine > 1 ? .10 : 0) * numLine) + 'em';

        return
    }

    sendMessage()
})

messageTextareaWrapperElement.addEventListener("click", function() {
    messageTextareaElement.select()
})

const messageInputSendButtonElement = document.getElementById("messageInputSendButton")
messageInputSendButtonElement.addEventListener("submit", function() {
    sendMessage()
})

function sendMessage() {
    if (messageTextareaElement.value == '') {
        return
    }

    console.log(messageTextareaElement.value)

    const newMessageKey = push(child(ref(db), '/dark_rooms/' + uid + '/messages')).key;

    const updates = {}
    updates['/dark_rooms/' + uid + '/messages/' + newMessageKey] = encrypt(messageTextareaElement.value, darkRoomCode)

    update(ref(db), updates);

    messageTextareaElement.value = ''
    messageTextareaElement.style.height = '1em'
    messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight
}

const destroyDarkRoomButtonElement = document.getElementById("destroyDarkRoomButton")
destroyDarkRoomButtonElement.addEventListener("click", function() {
    messsagesDivElement.innerHTML = ''

    const encryptedDarkRoomCode = encrypt(darkRoomCode, darkRoomCode)

    reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(encryptedDarkRoomCode + '@gmail.com', encryptedDarkRoomCode))
    .then(() => {
        auth.currentUser.delete()
        .catch((error) => {
            console.log(error)
        })

        localStorage.removeItem('darkRoomCode')
        remove(ref(db), '/dark_rooms/' + uid)
        auth.signOut()

    }).catch((error) => {
        console.log(error)
    });
})