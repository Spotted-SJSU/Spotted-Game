import React, { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import Login from './pages/Login'
import Home from './pages/Home'
import './index.css'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import Gameplay from './pages/Gameplay'

const theme = createTheme({ primaryColor: 'yellow' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={ <Login /> } />
          <Route path='/' element={ <Home /> } />
          <Route path='/game' element={ <Gameplay /> } />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
)
