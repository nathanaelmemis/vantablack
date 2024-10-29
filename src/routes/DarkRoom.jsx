import { signInWithCustomToken } from "firebase/auth";
import { ref, onValue } from "firebase/database";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DarkRoom.scss'

import axios from 'axios';

import { database as db, auth } from '../firebase'

import { Container, IconButton, Typography, Button, Box, Snackbar, Alert } from '@mui/material'
import { LockOpen, Lock, ContentCopy, Timer, Send, Delete, Logout } from '@mui/icons-material';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';

import { hash, encrypt, decrypt, parseMillisecondsToTime } from '../utils';

let domain = 'https://vantablack-server.vercel.app'

if (process.env.NODE_ENV === 'development') {
    domain = 'http://localhost:3000'
}

function DarkRoom() {
    const [messages, updateMessages] = useState([]);
    // const [renderedMessages, setRenderedMessage] = useState([]);
    const [messageInputValue, setMessageInputValue] = useState('');
    const [isMessagesEncrypted, setIsMessagesEncrypted] = useState(true)
    const [autoDestroyTimer, setautoDestroyTimer] = useState(null)
    const [dataHash, setDataHash] = useState(null)
    const [isCodeCopiedClipboard, setIsCodeCopiedClipboard] = useState(false)
    const [idToken, setIdToken] = useState(null)
    const darkRoomCredentials = JSON.parse(localStorage.getItem('darkRoomCredentials'))
    const navigate = useNavigate();

    if (!darkRoomCredentials) {
        navigate('/')
    }

    // firebase data fetching
    useEffect(() => {
        async function fetchData() {
            try {
                await signInWithCustomToken(auth, darkRoomCredentials.authToken)

                setIdToken(await auth.currentUser.getIdToken(true))

                const messagesRef = ref(db, 'dark_rooms/' + hash(darkRoomCredentials.darkRoomCode, 2));
                onValue(messagesRef, (snapshot) => {
                    if (snapshot.val() === null) {
                        localStorage.removeItem('darkRoomCredentials')
                        auth.signOut()
                        navigate('/')
                        return
                    }

                    const data = snapshot.val()
                    if (data.messages != null) {
                        updateMessages(data.messages);
                    }
                    if (autoDestroyTimer === null) {
                        setautoDestroyTimer(data.timeToDestroy)
                    }
                    if (dataHash === null) {
                        setDataHash(data.dataHash)
                    }
                });

            } catch (error) {
                console.log('Error occured while fetching user messages:', error)
                navigate('/')
            }
        }
        if (darkRoomCredentials) {
            fetchData()
        }
    }, [])
 
    // destroy timer handler
    useEffect(() => {
        const messagesContainerElement = document.getElementById('messagesContainer')
        messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight

        let intervalId = null

        const autoDestroyTimerElement = document.getElementById('autoDestroyTimer')
        if (autoDestroyTimer) {
            intervalId = setInterval(() => {
                autoDestroyTimerElement.textContent = parseMillisecondsToTime(autoDestroyTimer - Date.now())
                if (autoDestroyTimer - Date.now() < 1000) {
                    handleDestroyDarkRoomButtonClick()

                    clearInterval(intervalId);
                }
            }, 1000)
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [messages, autoDestroyTimer])

    async function handleSendMessage() {
        try {
            setTimeout(() => {
                setMessageInputValue('')
            }, 10)

            await axios.post(domain + '/send_message', {
                idToken: idToken,
                message: JSON.stringify(encrypt(messageInputValue, hash(darkRoomCredentials.darkRoomCode))),
                timeToDestroy: autoDestroyTimer,
                dataHash: dataHash
            })
        } catch (error) {
            console.log('Error occured while sending message:', error)
        }
    }

    const handleCodeCopyClipboard = () => {
        navigator.clipboard.writeText(darkRoomCredentials.darkRoomCode)
            .then(function () {
                setIsCodeCopiedClipboard(true)
            })
            .catch(function (err) {
                console.error("Failed to copy text: ", err);
            });
    }

    const handleCloseCodeCopyClipboardNotif = () => {
        setIsCodeCopiedClipboard(false)
    }

    function handleMessageClick(key, encryptedMessage) {
        const messageElement = document.getElementById(key);

        const state = messageElement.getAttribute('state')

        if (state == 'encrypted') {
            messageElement.children[0].textContent = decrypt(encryptedMessage, hash(darkRoomCredentials.darkRoomCode))
            messageElement.setAttribute('state', 'decrypted')
            messageElement.style.color = 'white'
        } else {
            messageElement.children[0].textContent = 'Message Encrypted'
            messageElement.setAttribute('state', 'encrypted')
            messageElement.style.color = 'gray'
        }
    }

    function handleLogoutButtonClick() {
        localStorage.removeItem('darkRoomCredentials')
        auth.signOut()
        navigate('/')
    }

    function handleDestroyDarkRoomButtonClick() {
        localStorage.removeItem('darkRoomCredentials')

        axios.post(domain + '/destroy_room', {
            idToken: idToken
        })
            .then(() => {
                auth.signOut()
                navigate('/')
            })
            .catch(error => {
                console.log('Error occured while destroying room:', error)
            });
    }

    function handleMessageInputKeyPress(e) {
        if (e.shiftKey) {
            return
        }

        if (e.key === 'Enter') {
            if (/^\s*$/.test(messageInputValue)) {
                setTimeout(() => {
                    setMessageInputValue('')
                }, 10)
                return
            }

            handleSendMessage()
        }
    }

    // messages rendering
    let renderedMessages = []
    if (messages != null && darkRoomCredentials) {
        Object.entries(messages).forEach(([key, value]) => {
            if (isMessagesEncrypted) {
                renderedMessages.push(
                    <Box
                        width='100%'
                        id={`message-${key}`}
                        key={key}
                        state='encrypted'
                        onClick={() => { handleMessageClick(`message-${key}`, value) }}
                        sx={{
                            backgroundColor: 'rgb(50, 50, 50)',
                            padding: '.5em',
                            borderRadius: '3px',
                            mb: '.5em',
                            cursor: 'pointer',
                            whiteSpace: 'pre-line',
                            wordWrap: 'break-word',
                            ":hover": { backgroundColor: 'rgb(40, 40, 40)' }
                        }}>
                        <Typography color='primary'>Message Encrypted</Typography>
                    </Box>
                )
            } else {
                renderedMessages.push(
                    <Box
                        width='100%'
                        key={key}
                        sx={{
                            backgroundColor: 'rgb(50, 50, 50)',
                            padding: '.5em',
                            borderRadius: '3px',
                            mb: '.5em',
                            whiteSpace: 'pre-line',
                            wordWrap: 'break-word',
                        }}>
                        <Typography color='primary'>{decrypt(value, hash(darkRoomCredentials.darkRoomCode))}</Typography>
                    </Box>
                )
            }
        });
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
            <Box width='100%' margin='1em' display='flex' justifyContent='space-between'>
                <Box 
                    display='flex'
                    alignItems='center'>

                    {/* Destroy Button */}
                    <Button variant='outlined' color='error' sx={{ mx: '1em', display: { xs: 'none', sm: 'flex' } }} onClick={handleDestroyDarkRoomButtonClick} startIcon={<Delete />}>Destroy</Button>
                    <IconButton color='error' sx={{ mx: '.25em', display: { xs: 'block', sm: 'none' } }} onClick={handleDestroyDarkRoomButtonClick}>
                        <Delete />
                    </IconButton>

                    {/* Logout Button */}
                    <Button variant='outlined' color='error' sx={{ display: { xs: 'none', sm: 'flex' } }} onClick={handleLogoutButtonClick} startIcon={<Logout />}>Logout</Button>
                    <IconButton color='error' sx={{ mx: '.25em', display: { xs: 'block', sm: 'none' } }} onClick={handleLogoutButtonClick}>
                        <Logout />
                    </IconButton>
                </Box>

                <Box display='flex' alignItems='center'>
                    {!autoDestroyTimer ? '' :
                        <>
                            <Timer color='primary' />
                            <Typography id='autoDestroyTimer' color='primary' ml='.25em' mr='1em'>00:00:00</Typography>
                        </>
                    }
                    <Button variant="outlined" onClick={() => { setIsMessagesEncrypted(!isMessagesEncrypted) }} color={isMessagesEncrypted ? 'success' : 'warning'} sx={{ display: { xs: 'none', sm: 'flex' } }} startIcon={isMessagesEncrypted ? <Lock /> : <LockOpen />}>{isMessagesEncrypted ? 'Encrypted' : 'Decrypted'}</Button>
                    <IconButton color={isMessagesEncrypted ? 'success' : 'warning'} sx={{ mx: '.25em', display: { xs: 'block', sm: 'none' } }} onClick={() => { setIsMessagesEncrypted(!isMessagesEncrypted) }}>
                        {isMessagesEncrypted ? <Lock /> : <LockOpen />}
                    </IconButton>
                    <Button variant='outlined' color='primary' sx={{ mx: '1em', display: { xs: 'none', sm: 'flex' } }} onClick={handleCodeCopyClipboard} startIcon={<ContentCopy />}>Copy Code</Button>
                    <IconButton color='primary' sx={{ mx: '.25em', display: { xs: 'block', sm: 'none' } }} onClick={handleCodeCopyClipboard}>
                        <ContentCopy />
                    </IconButton>
                </Box>
            </Box>
            <Box id='messagesContainer' sx={{ mb: '1em', flexGrow: 1, overflowY: 'auto', width: '100%' }}>
                <Container maxWidth='md'>
                    {Object.keys(renderedMessages).length ? renderedMessages :
                        <Box mt='30%' textAlign='center' width='100%' key='key'>
                            <Typography variant='h3' color='primary'>Welcome!</Typography>
                        </Box>
                    }
                </Container>
            </Box>
            <Container maxWidth='md' display='flex' sx={{ mb: '2em' }} >
                <TextareaAutosize className='message-input' maxRows={7} placeholder='Write a message...' value={messageInputValue} onChange={e => setMessageInputValue(e.target.value)} onKeyDown={handleMessageInputKeyPress} />
                <Button variant='contained' color='primary' onClick={handleSendMessage} sx={{ mt: '-2em', ml: '.5em' }} endIcon={<Send />}>Send</Button>
            </Container>
            <Snackbar open={isCodeCopiedClipboard} autoHideDuration={6000} onClose={handleCloseCodeCopyClipboardNotif}>
                <Alert
                    onClose={handleCloseCodeCopyClipboardNotif}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Dark room code copied to clipboard.
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default DarkRoom