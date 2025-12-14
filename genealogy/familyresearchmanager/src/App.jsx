import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import { PeopleList, PersonProfile } from '../components/PersonProfile.jsx'

function App() {

  // State to store the list of family members
 // const [people, setPeople] = useState([]);

  // Global historical events state
 // const [historicalEvents, setHistoricalEvents] = useState([]);

  // Event and attribute types
 // const [eventTypes, setEventTypes] = useState(defaultEventTypes);
  //const [attributeTypes, setAttributeTypes] = useState(defaultAttributeTypes);

  // Source hierarchy state (normalized)
  // Repositories: where records are officially held or accessed from
  //const [repositories, setRepositories] = useState(defaultRepositories);

  // Collections: groups of records (e.g., "1940 US Federal Census")
  // { id, title, creator, repositoryId (official), recordType (template key), notes }
  //const [collections, setCollections] = useState([]);

  // Source Items: specific documents/images within a collection
  // { id, collectionId, accessRepositoryId (where accessed), metadata: {}, attachments: [], notes }
  //const [sourceItems, setSourceItems] = useState([]);

  // Legacy sources state (for backwards compatibility during migration)
  //const [sources, setSources] = useState([]);


  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/people" element={<PeopleList />} />
        <Route path="/people/:id" element={<PersonProfile />} />
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