import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function PersonProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Person state
  const [person, setPerson] = useState(null);
  const [givenName, setGivenName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Events state
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  const EVENT_TYPES = [
    ['birth', 'Birth'],
    ['baptism', 'Baptism'],
    ['christening', 'Christening'],
    ['death', 'Death'],
    ['burial', 'Burial'],
    ['marriage', 'Marriage'],
    ['divorce', 'Divorce'],
    ['immigration', 'Immigration'],
    ['emigration', 'Emigration'],
    ['census', 'Census'],
    ['residence', 'Residence'],
    ['occupation', 'Occupation'],
    ['military', 'Military Service'],
    ['education', 'Education'],
  ];

  // Fetch person data from API
  useEffect(() => {
    fetch(`/api/people/${id}/`)
      .then(res => res.json())
      .then(data => {
        setPerson(data);
        setGivenName(data.given_name);
        setLastName(data.last_name);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching person:', err);
        setLoading(false);
      });
  }, [id]);

   // Fetch events for this person
  useEffect(() => {
    fetch(`/api/events/?person=${id}`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, [id]);

  const handleSave = async () => {
    const res = await fetch(`/api/people/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ given_name: givenName, last_name: lastName })
    });
    const updated = await res.json();
    setPerson(updated);
    setIsEditing(false);
  };

   const handleAddEvent = async (e) => {

    e.preventDefault();

    const res = await fetch('/api/events/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        person: id,
        event_type: eventType,
        date: eventDate || null,
        location: eventLocation,
        notes: eventNotes
      })
    });

    const saved = await res.json();
    setEvents([...events, saved]);

    // Reset form
    setEventType('');
    setEventDate('');
    setEventLocation('');
    setEventNotes('');
    setShowEventForm(false);
  };

  const handleDeleteEvent = async (eventId) => {
    await fetch(`/api/events/${eventId}/`, {
      method: 'DELETE',
    });
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleDeletePerson = async () => {
  if (window.confirm(`Are you sure you want to delete ${person.given_name} ${person.last_name}?`)) {
    await fetch(`/api/people/${id}/`, {
      method: 'DELETE',
    });
    navigate('/people');
  }
};

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  if (!person) {
    return <div className="app">Person not found.</div>;
  }

  {/* Returns Person Profile inclusive of events */}

  return (
    <div className="app">
      <h1>Person Profile</h1>
      {isEditing ? (
        <div className="family-form">

          <div className="form-group">

            <label>Given Name</label>
            <input
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
            />

          </div>
          <div className="form-group">

            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

          </div>

          <div className="button-row">

            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>

          </div>

        </div>
      ) : (
        <div className="family-list">

          <p><strong>Name:</strong> {person.given_name} {person.last_name}</p>

          <div className="button-row">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button className="delete-btn" onClick={handleDeletePerson}>Delete Person</button>
          </div>

        </div>
      )}

      {/* Events Section */}
      <h2>Events</h2>
      {events.length > 0 ? (
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <strong>{EVENT_TYPES.find(t => t[0] === event.event_type)?.[1] || event.event_type}</strong>
              {event.date && ` - ${event.date}`}
              {event.location && ` at ${event.location}`}
              {event.notes && <p>{event.notes}</p>}
              <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events recorded.</p>
      )}

      {showEventForm ? (
        <form onSubmit={handleAddEvent} className="family-form">

          <div className="form-group">

            <label>Event Type</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} required>
              <option value="">Select...</option>
              {EVENT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

          </div>

          <div className="form-group">

            <label>Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />

          </div>

          <div className="form-group">

            <label>Location</label>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
            />

          </div>

          <div className="form-group">

            <label>Notes</label>
            <textarea
              value={eventNotes}
              onChange={(e) => setEventNotes(e.target.value)}
            />

          </div>

          <div className="button-row">

            <button type="submit">Add Event</button>
            <button type="button" onClick={() => setShowEventForm(false)}>Cancel</button>

          </div>

        </form>
      ) : (
        <button onClick={() => setShowEventForm(true)}>Add Event</button>
      )}

      <p><Link to="/people">Back to People List</Link></p>
    </div>
  );
}

function PeopleList() {
  const [people, setPeople] = useState([]);
  const [givenName, setGivenName] = useState('');
  const [lastName, setLastName] = useState('');

  // Fetch from Django API
  useEffect(() => {
    fetch('/api/people/')
      .then(res => res.json())
      .then(data => setPeople(data));
  }, []);

    // Add a person
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/people/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ given_name: givenName, last_name: lastName })
    });
    const saved = await res.json();

    setPeople([...people, saved]);
    setGivenName('');
    setLastName('');
  };

    return (
    <div className="app">
      <h2>People</h2>
      
      <form onSubmit={handleSubmit} className="family-form">

        <div className="form-group">
          <label>Given Name</label>
          <input
            type="text"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <button type="submit">Add Person</button>

      </form>

      {/* List of people in the database */}

      <ul>
        {people.map(person => (
          <li key={person.id}>
            <Link to={`/people/${person.id}`}>
              {person.last_name}, {person.given_name} 
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PersonProfile, PeopleList };