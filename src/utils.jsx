import CryptoJS from "crypto-js"

function generateDarkRoomCode() {
    const darkRoomCodeLength = 11
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let darkRoomCode = '';
    
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < darkRoomCodeLength) {
        darkRoomCode += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return darkRoomCode;
}

function hash(input, iteration = 1) {
    let hashedInput = input
    for (let i = 0; i < iteration; i++) {
        hashedInput = CryptoJS.SHA256(hashedInput).toString(CryptoJS.enc.Hex)
    }
    return hashedInput
}

function encrypt(text, key) {
    return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(encryptedText, key) {
    return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8)
}

function parseMillisecondsToTime(miliseconds) {
    let hours = Math.floor(miliseconds / 3600000);
    miliseconds -= (hours * 3600000);
    let mins = Math.floor(miliseconds / 60000);
    miliseconds -= (mins * 60000);
    let secs = Math.floor(miliseconds / 1000);

    // Pad hours, minutes, and seconds with leading zeros
    hours = String(hours).padStart(2, '0');
    mins = String(mins).padStart(2, '0');
    secs = String(secs).padStart(2, '0');

    // console.log(miliseconds, hours, mins, secs)

    return `${hours}:${mins}:${secs}`;
}

export { generateDarkRoomCode, hash, encrypt, decrypt, parseMillisecondsToTime }