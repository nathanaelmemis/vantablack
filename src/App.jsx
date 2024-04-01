import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './routes/Login.jsx';
import DarkRoom from './routes/DarkRoom.jsx';

function App() {
  return (
    <Routes>
      <Route path={'/'} element={<Login />} />
      <Route path={'/dark_room'} element={<DarkRoom />} />
    </Routes>
  );
}

export default App;
