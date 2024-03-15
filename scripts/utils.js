const DARK_ROOM_CODE_LENGTH = 11

function generateDarkRoomCode() {
    let darkRoomCode = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < DARK_ROOM_CODE_LENGTH) {
        darkRoomCode += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return darkRoomCode;
}

function encrypt(data, key) {
    data = data.split('')
    key = key.split('').reverse()

    let keySum = 0
    for (const char of key) {
        keySum += char.charCodeAt(0)
    }

    let keyIndex = 0
    let encryptedData = ''
    for(const dataIndex in data) {
        if (keyIndex > key.length) {
            keyIndex = 0
        }

        encryptedData += String.fromCharCode(data[dataIndex].charCodeAt(0) + key[keyIndex].charCodeAt(0) + keySum)
    }

    return encryptedData
}

function decrypt(encryptedData, key) {
    encryptedData = encryptedData.split('')
    key = key.split('').reverse()

    let keySum = 0
    for (const char of key) {
        keySum += char.charCodeAt(0)
    }

    let keyIndex = 0
    let decryptedData = ''
    for (const dataIndex in encryptedData) {
        if (keyIndex > key.length) {
            keyIndex = 0
        }

        decryptedData += String.fromCharCode(encryptedData[dataIndex].charCodeAt(0) - key[keyIndex].charCodeAt(0) - keySum)
    }

    return decryptedData
}

export { generateDarkRoomCode, encrypt, decrypt}