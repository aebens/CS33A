import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import { PeopleList, PersonProfile } from '../components/PersonProfile.jsx'
import Sources from '../components/Sources.jsx'
import Reports from '../components/Reports.jsx'
import CitationForm from '../components/CitationForm.jsx'

function App() {

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/people" element={<PeopleList />} />
        <Route path="/people/:id" element={<PersonProfile />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/citations/new" element={<CitationForm />} />
      </Routes>
    </BrowserRouter>
  )

}

// Home Page Component
    function HomePage() {
    return (
        <div className="app">
        <h1>Family Research Manager</h1>
        <p>Please use the navigation above to get started.</p>
        </div>
    );
    }

export default App