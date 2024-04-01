import { Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DarkRoom.scss'

import Messages from '../components/Messages';
import MessageInput from '../components/MessageInput';
import Navbar from '../components/Navbar';
import { hash, encrypt } from '../utils';

let domain = 'wss://vantablack-server.vercel.app'

if (process.env.NODE_ENV === 'development') {
  domain = 'ws://localhost:3000'
}

function DarkRoom() {
  const [messages, setMessages] = useState([]);
  const [messageInputValue, setMessageInputValue] = useState('');
  const [messagesEncrypted, setMessagesEncrypted] = useState(true)
  const [autoDestroyTimerTimestamps, setAutoDestroyTimerTimestamps] = useState({timeToDestroy: 0, isNotInitialized: true})
  const darkRoomCode = localStorage.getItem('darkRoomCode');
  const navigate = useNavigate();

  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(domain + '/socket');

    // Event listener for when the WebSocket connection is opened
    socket.current.onopen = () => {
      // console.log('WebSocket connection opened');

      socket.current.send(JSON.stringify({
        action: 'startDataListener',
        darkRoomCode: hash(darkRoomCode, 2)
      }))
    };

    // Event listener for incoming messages
    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === 'destroy') {
        localStorage.removeItem('darkRoomCode')
        navigate('/')
        return
      }

      if (data.status == 400) {
        console.log(data.message)
        return
      }

      setMessages(() => [data.messages]);

      if (autoDestroyTimerTimestamps.isNotInitialized) {
        // console.log(data)
        setAutoDestroyTimerTimestamps({
          timeToDestroy: data.timeToDestroy,
          isNotInitialized: false
        })
      }
    };

    // Event listener for WebSocket errors
    socket.current.onerror = (error) => {
      // console.error('WebSocket error:', error);
    };

    // Event listener for WebSocket connection close
    socket.current.onclose = () => {
      // console.log('WebSocket connection closed');
    };

    // Clean up function to close the WebSocket connection when the component unmounts
    return () => {
      socket.current.close();
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault()

    function getTextWidth(text, font) {
      const span = document.createElement('span');
      span.style.font = font;
      span.textContent = text;
      document.body.appendChild(span);
      const width = span.offsetWidth;
      document.body.removeChild(span);
      return width;
    }

    const messageInputElement = document.getElementById('messageInput')

    // console.log(e.key, (e.key !== 'Enter' || e.shiftKey) && e.key !== undefined)

    if ((e.key !== 'Enter' || e.shiftKey) && e.key !== undefined) {
      const value = e.target.value
      const messageInputElement = document.getElementById('messageInput')
      const messageInputElementFontStyle = getComputedStyle(messageInputElement).fontSize + ' ' + getComputedStyle(messageInputElement).fontFamily
      const trueOffsetWidth = messageInputElement.offsetWidth - 19

      let newValue = ''
      const words = value.split(/([ \n])/)
      let lineWidth = 0
      for (const word of words) {
        let width = 0

        if (word == ' ') {
          width = 1
        } else {
          width = getTextWidth(word, messageInputElementFontStyle);
        }

        lineWidth += width

        // console.log(lineWidth, trueOffsetWidth, word)

        if (lineWidth >= trueOffsetWidth) {
          lineWidth = width
          newValue += '\n'
        } else if (word == '\n') {
          lineWidth = 0
        }

        newValue += word
      }

      // console.log(words)
      // console.log(newValue)

      // calculate true width caused by \n delims
      const paragraphs = newValue.split(/(\n)/);
      let textWidth = 0
      let lastLineWidth = ''
      for (const line of paragraphs) {
        if (line == '\n') {
          if (lastLineWidth > trueOffsetWidth) {
            const quotient = Math.floor(lastLineWidth / trueOffsetWidth)
            lastLineWidth -= quotient * trueOffsetWidth

            textWidth += Math.floor(trueOffsetWidth - lastLineWidth) + 1
          } else {
            textWidth += Math.abs(trueOffsetWidth - lastLineWidth) + 1
          }
        } else {
          const width = getTextWidth(line, messageInputElementFontStyle);
          lastLineWidth = width
          textWidth += width
        }
      }

      const rows = Math.floor(textWidth / trueOffsetWidth) + 1

      // console.log(textWidth, trueOffsetWidth, rows)

      if (rows > 7) {
        messageInputElement.style.height = `${String((7 * .15) + 7)}em`;
      } else if (textWidth > trueOffsetWidth) {
        messageInputElement.style.height = `${String((rows * .15) + rows)}em`;
      } else {
        messageInputElement.style.height = '1em'
      }

      return
    }

    if (messageInputValue.trim() == '') {
      setMessageInputValue('')
      messageInputElement.style.height = '1em'

      return
    }

    // console.log('Sending:', messageInputValue)

    socket.current.send(JSON.stringify({
      action: 'sendMessage',
      darkRoomCode: hash(darkRoomCode, 2),
      message: encrypt(messageInputValue, hash(darkRoomCode))
    }))
    setMessageInputValue('')

    messageInputElement.style.height = '1em'
  }

  return (
    darkRoomCode == null ? <Navigate to='/' /> :
      <div className='dark-room-container'>
        <Navbar 
          darkRoomCode={darkRoomCode} 
          messagesEncrypted={messagesEncrypted}
          setMessagesEncrypted={setMessagesEncrypted}
          timeToDestroy={autoDestroyTimerTimestamps.timeToDestroy}/>
        <Messages 
          messages={messages} 
          darkRoomCode={darkRoomCode}
          messagesEncrypted={messagesEncrypted}
        />
        <MessageInput
          handleSendMessage={handleSendMessage}
          messageInputValue={messageInputValue}
          setMessageInputValue={setMessageInputValue}
        />
      </div>
  )
}

export default DarkRoom