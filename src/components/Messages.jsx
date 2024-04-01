import React, { useEffect } from 'react';
import './Messages.scss'
import { hash, decrypt } from '../utils';

const Messages = React.memo(({ messages, darkRoomCode, messagesEncrypted }) => {
    // console.log('messages', messages)

    function handleMessageClick(key, encryptedMessage) {
        // console.log(key, encryptedMessage)
        const messageElement = document.getElementById(key);

        const state = messageElement.getAttribute('state')

        if (state == 'encrypted') {
            messageElement.textContent = decrypt(encryptedMessage, hash(darkRoomCode))
            messageElement.setAttribute('state', 'decrypted')
            messageElement.style.color = 'white'
        } else {
            messageElement.textContent = 'Message Encrypted'
            messageElement.setAttribute('state', 'encrypted')
            messageElement.style.color = 'gray'
        }
    }

    let renderedMessages = []
    if (messages[0] != null) {
        Object.entries(messages[0]).forEach(([key, value]) => {
            if (messagesEncrypted) {
                renderedMessages.push(<p className='message encrypedMessage' style={{color: 'gray'}} id={`message-${key}`} state='encrypted' key={key} onClick={() => {handleMessageClick(`message-${key}`, value)}}>Message Encrypted</p>)
            } else {
                renderedMessages.push(<p className='message' style={{color: 'white'}} key={key}>{decrypt(value, hash(darkRoomCode))}</p>)
            }
        });
    } else {
        renderedMessages[0] = <h1 className='welcome-message' key={'welcome-message'}>Welcome!</h1>
    }

    useEffect(() => {
        const element = document.getElementById("messages");
        
        if (element.scrollHeight) {
            element.scrollTop = element.scrollHeight;
        }
    })
    
    return (
        <div className='message-container'>
            <div className='message-wrapper' id='messages'>{renderedMessages}</div>
        </div>
    )
})

export default Messages