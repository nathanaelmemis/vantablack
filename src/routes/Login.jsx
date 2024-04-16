import { useEffect, useState } from 'react'
import './Login.scss'
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';

import { Container, TextField, Typography, Button, Tabs, Tab, Box, Snackbar, Alert } from '@mui/material'
import PropTypes from 'prop-types';

import InteractiveInput from '../components/InteractiveInput'
import { generateDarkRoomCode, hash } from '../utils';


let domain = 'https://vantablack-server.vercel.app'

if (process.env.NODE_ENV === 'development') {
  domain = 'http://localhost:3000'
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{p: 3, display: 'flex', flexDirection: 'column', alignItems: 'end'}}>
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function Login() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [code, setCode] = useState('')
  const [isFailedLogin, setIsFailedLogin] = useState(false)
  const [isFailedCreateRoom, setIsFailedCreateRoom] = useState(false)
  const [inactiveDaysLimit, setInactiveDaysLimit] = useState('30')
  const [autoDestroyTimer, setAutoDestroyTimer] = useState('00:00:00')
  const navigate = useNavigate();

  useEffect(() => {
    async function autoLogin() {
      try {
        const darkRoomCredentials = JSON.parse(localStorage.getItem('darkRoomCredentials'))
        if (!darkRoomCredentials) {
          return
        }
    
        const response = await axios.post(domain + '/login', {
          darkRoomCode: hash(darkRoomCredentials.darkRoomCode, 2)
        })
    
        const authToken = response.data.data.authToken
    
        localStorage.setItem('darkRoomCredentials', JSON.stringify({darkRoomCode: darkRoomCredentials.darkRoomCode, authToken: authToken}));
        navigate('/dark_room')
      } catch (error) {
        localStorage.removeItem('darkRoomCredentials')
      }
    }
    autoLogin()
  }, [])
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  async function handleLogin(e) {
    e.preventDefault()
    
    try {
      const response = await axios.post(domain + '/login', {
        darkRoomCode: hash(code, 2)
      })

      const authToken = response.data.data.authToken

      localStorage.setItem('darkRoomCredentials', JSON.stringify({darkRoomCode: code, authToken: authToken}));
      navigate('/dark_room')
    } catch {
      setIsFailedLogin(true)
      setCode('')
    }
  }

  function handleCodeChange(e) {
    setCode(e.target.value)
    if(isFailedLogin) {
      setIsFailedLogin(false)
    }
  }

  async function handleCreateRoom(event) {
    event.preventDefault();

    let darkRoomCode = generateDarkRoomCode()

    try {
      const response = await axios.post(domain + '/create_room', {
        darkRoomCode: hash(darkRoomCode, 2),
        inactiveDaysLimit: inactiveDaysLimit,
        autoDestroyTimer: autoDestroyTimer
      })

      const authToken = response.data.data.authToken

      localStorage.setItem('darkRoomCredentials', JSON.stringify({darkRoomCode: darkRoomCode, authToken: authToken}));
      navigate('/dark_room')
    } catch (error) {
      console.log('Error occured while creating dark room.', error)
      setIsFailedCreateRoom(true)
    }
  }

  const handleFailedCreateRoomMessageClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsFailedCreateRoom(false);
  };


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
    <Container maxWidth='sm' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
      <Typography variant='h2' color='primary' sx={{ textAlign: 'center', mb: '.25em', mt: '40%', }} type='password'>Vantablack</Typography>
      <Tabs value={selectedTab} onChange={handleTabChange} textColor='primary'>
        <Tab label='Enter Room' {...a11yProps(0)} />
        <Tab label='Create Room' {...a11yProps(1)} />
      </Tabs>
      <CustomTabPanel value={selectedTab} index={0}>
        <TextField variant='outlined' color='secondary' label={isFailedLogin ? 'Invalid Dark Room Code' : 'Dark Room Code'} type='password' value={code} onChange={handleCodeChange} sx={{ width: '15em', mb: '1em'}} error={isFailedLogin} />
        <Button variant='outlined' color='secondary' onClick={handleLogin} sx={{ width: '6em' }}>Enter</Button>
      </CustomTabPanel>
      <CustomTabPanel value={selectedTab} index={1}>
        <TextField variant='outlined' color='secondary' label='Inactive Days Limit' shrink='true' value={inactiveDaysLimit} onChange={handleInactiveDaysLimitChange} sx={{ width: '15em', mb: '1em'}} />
        <TextField variant='outlined' color='secondary' label='Auto Destroy Timer' shrink='true' value={autoDestroyTimer} onChange={handleAutoDestroyTimerChange} sx={{ width: '15em', mb: '1em'}} />
        <Button variant='outlined' color='secondary' onClick={handleCreateRoom} sx={{ width: '6em' }}>Create</Button>
      </CustomTabPanel>
      <Snackbar open={isFailedCreateRoom} autoHideDuration={6000} onClose={handleFailedCreateRoomMessageClose}>
        <Alert
          onClose={handleFailedCreateRoomMessageClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          An error occured while creating dark room.
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Login