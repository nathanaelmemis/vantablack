import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import DarkRoom from './components/DarkRoom.jsx';

let extendedPath = ''

if (process.env.NODE_ENV === 'production') {
  extendedPath = '/vantablack'
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={extendedPath +"/"} element={<Login />} />
        <Route path={extendedPath + "/dark_room"} element={<DarkRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
