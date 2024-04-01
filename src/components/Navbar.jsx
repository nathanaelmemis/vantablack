import './Navbar.scss'

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { hash } from '../utils';
import { useEffect, useState } from 'react';

let domain = 'https://vantablack-server.vercel.app'

if (process.env.NODE_ENV === 'development') {
    domain = 'http://localhost:3000'
}

function Navbar({ darkRoomCode, messagesEncrypted, setMessagesEncrypted, timeToDestroy }) {
    const navigate = useNavigate();
    const [autoDestroyRemainingTime, setAutoDestroyRemainingTime] = useState(null)

    function handleDestroyDarkRoomButtonClick() {
        localStorage.removeItem('darkRoomCode')

        axios.post(domain + '/destroy_room', {
          code: hash(darkRoomCode, 2)
        })
        .then(() => {
          navigate('/')
        })
        .catch(error => {
            console.log(error)
        });
    }

    let timeout = null
    function handleCopyDarkRoomCodeButtonClick() {
        navigator.clipboard.writeText(darkRoomCode)
        .then(function() {
            clearTimeout(timeout);

            const toastElement = document.getElementById('toast')
            toastElement.style.opacity = 1
            timeout = setTimeout(() => {
                toastElement.style.opacity = 0
            }, 2000)
        })
        .catch(function(err) {
            console.error("Failed to copy text: ", err);
        });
    }

    function parseMilisecondsToTime(miliseconds) {
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

    useEffect(() => {
        if (timeToDestroy === 0) {
            return
        }

        setTimeout(() => {
            // console.log(timeToDestroy)
            setAutoDestroyRemainingTime(parseMilisecondsToTime(timeToDestroy - Date.now()))
        }, 1000)

        // console.log('time changed')
    })

    return(
        <div className="navbar-container">
            <div className='destroy-dark-room' onClick={handleDestroyDarkRoomButtonClick}>
                <img src="./assets/trash-can.svg" alt="Description of the image" />
                <p>Destroy Dark Room</p>
            </div>
            <div className='right-container'>
                <div className={`auto-destroy-timer-wrapper ${autoDestroyRemainingTime ? '' : 'hide'}`}>
                    <p className='auto-destroy-timer'>{autoDestroyRemainingTime}</p>
                </div>
                <img className={'messages-encrypted-toggle' + `${messagesEncrypted ? ' toggled' : ''}`} src={`../assets/${messagesEncrypted ? 'locked' : 'unlocked'}.svg`} onClick={() => {setMessagesEncrypted(!messagesEncrypted)}} />
                <div className='copy-dark-room-container'>
                    <div className='copy-dark-room-code' onClick={handleCopyDarkRoomCodeButtonClick}>
                        <img src="./assets/copy.svg" alt="Description of the image" />
                        <p>Copy Dark Room Code</p>
                    </div>
                    <p id='toast'>Copied to clipboard!</p>
                </div>
            </div>
        </div>
    )
}

export default Navbar