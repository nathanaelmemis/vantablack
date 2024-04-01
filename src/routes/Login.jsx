import { useState } from 'react'
import './Login.scss'
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';

import InteractiveInput from '../components/InteractiveInput'
import { generateDarkRoomCode, hash } from '../utils';

let domain = 'https://vantablack-server.vercel.app:3000'

if (process.env.NODE_ENV === 'development') {
  domain = 'http://localhost:3000'
}

function Login() {
    const [code, setCode] = useState('')
    const [isFailedLogin, setIsFailedLogin] = useState('')
    const [createRoomSettingsShown, setCreateRoomSettingsShown] = useState(false)
    const [inactiveDaysLimit, setInactiveDaysLimit] = useState('30')
    const [autoDestroyTimer, setAutoDestroyTimer] = useState('00:00:00')
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault()

        // console.log('hashedCode:', hash(code, 2))

        axios.post(domain + '/login', {
          code: hash(code, 2)
        })
        .then(() => {
          localStorage.setItem('darkRoomCode', code);
          navigate('/dark_room')
        })
        .catch(() => {
          setIsFailedLogin(true)
          setCode('')
          const input = document.getElementById('code');
          input.style.backgroundColor = '#8b1c17'
          setTimeout(() => {
            setIsFailedLogin(false)
            input.style.backgroundColor = 'white'
          }, 1000);
        });
    }

    async function handleCreateRoom(event) {
      event.preventDefault();

      let darkRoomCode = generateDarkRoomCode()

      async function isDarkRoomCodeValid() {
        try {
          const response = await axios.post(domain + '/create_room', {
            code: hash(darkRoomCode, 2),
            inactiveDaysLimit: inactiveDaysLimit,
            autoDestroyTimer: autoDestroyTimer
          })

          return response.status == 200
        } catch(error) {
          console.log('Error occured while creating dark room.', error)
        }
      }

      while (!await isDarkRoomCodeValid(code)) {
        darkRoomCode = generateDarkRoomCode()
      }

      localStorage.setItem('darkRoomCode', darkRoomCode);
      navigate('/dark_room')
    }

    function handleCreateRoomSettingsToggle(e) {
      e.preventDefault()

      if (createRoomSettingsShown) {
        setInactiveDaysLimit('30')
        setAutoDestroyTimer('00:00:00')
      }

      setCreateRoomSettingsShown(!createRoomSettingsShown)
    }

    function handleInactiveDaysLimitChange(e) {
      const value = e.target.value

      if (isNaN(value)) {
        setInactiveDaysLimit('30')
        return
      }

      setInactiveDaysLimit(value)
    }

    function handleAutoDestroyTimerChange(e) {
      const value = e.target.value
      const parts = value.split(':')

      if (parts.length !== 3) {
        e.target.value = autoDestroyTimer
        return
      }

      if (parts[0] > 99) {
        setAutoDestroyTimer(`99:${parts[1]}:${parts[2]}`)
        return
      }

      if (parts[1] > 59) {
        setAutoDestroyTimer(`${parts[0]}:59:${parts[2]}`)
        return
      }

      if (parts[2] > 59) {
        setAutoDestroyTimer(`${parts[0]}:${parts[1]}:59`)
        return
      }

      for (const time of parts) {
        if (isNaN(time) || time.length > 2) {
          e.target.value = autoDestroyTimer
          return
        }
      }

      setAutoDestroyTimer(value)
    }

    return (
      localStorage.getItem('darkRoomCode') ? <Navigate to='/dark_room' /> :
      <div className='login-form-container'>
        <form className='login-form' onSubmit={handleLogin}>
          <h1>Vantablack</h1>
          <InteractiveInput code={code} setCode={setCode} isFailedLogin={isFailedLogin}/>
          <p>or</p>
          <button className='create-room' onClick={handleCreateRoom}>Create Dark Room</button>
          <button className='create-room-settings-toggle' onClick={handleCreateRoomSettingsToggle}>{createRoomSettingsShown ? '––––––' : 'settings'}<span className={createRoomSettingsShown ? 'arrow-down' : 'arrow-up'}></span></button>
          <div className={`create-room-settings-container ${createRoomSettingsShown ? 'show' : 'hide'}`}>
            <div>
              <span>Inactive Days Limit: </span>
            <input type="text" value={inactiveDaysLimit} onChange={handleInactiveDaysLimitChange}></input>
            </div>
            <div>
              <span>Auto Destroy Timer: </span>
              <input type="text" value={autoDestroyTimer} onChange={handleAutoDestroyTimerChange}></input>
            </div>
          </div>
        </form>
      </div>
    )
}

export default Login