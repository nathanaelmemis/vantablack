import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import DarkRoom from './components/DarkRoom.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dark_room" element={<DarkRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
