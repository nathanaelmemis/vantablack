import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HashRouter as Router } from "react-router-dom";
import './index.scss'
import { createTheme, ThemeProvider, TextField } from '@mui/material';
import { orange } from '@mui/material/colors'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: orange[50]
    },
    secondary: {
      main: orange[200]
    }
  },
  typography: {
    fontFamily: 'sans-serif'
  },
});
  
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Router>
);