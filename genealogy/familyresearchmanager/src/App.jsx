import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
    </BrowserRouter>
  )
}

export default App