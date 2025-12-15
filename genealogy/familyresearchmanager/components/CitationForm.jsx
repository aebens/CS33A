import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

function CitationForm() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const personId = searchParams.get('person');
	const eventId = searchParams.get('event');

	// Data
	const [sources, setSources] = useState([]);
    const [event, setEvent] = useState(null);
    const [person, setPerson] = useState(null);

	// Form state
	const [sourceId, setSourceId] = useState('');
	const [page, setPage] = useState('');
	const [lineNumber, setLineNumber] = useState('');
	const [nameAsRecorded, setNameAsRecorded] = useState('');
	const [transcription, setTranscription] = useState('');
	const [notes, setNotes] = useState('');

	// Fetch sources, people, and events
	useEffect(() => {
        fetch('/api/sources/')
            .then(res => res.json())
            .then(data => setSources(data));
        
        fetch(`/api/events/${eventId}/`)
            .then(res => res.json())
            .then(data => setEvent(data));
        
        fetch(`/api/people/${personId}/`)
            .then(res => res.json())
            .then(data => setPerson(data));
    }, [eventId, personId]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		await fetch('/api/citations/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				event: [eventId],
				source: sourceId,
				page,
				line_number: lineNumber,
				name_as_recorded: nameAsRecorded,
				transcription,
				notes
			})
		});

		navigate(`/people/${personId}`);
	};

	return (
		<div className="app">
			<h1>Add Citation</h1>
			<p>Citing {event?.event_type} for {person?.given_name} {person?.last_name}</p>

			<form onSubmit={handleSubmit} className="family-form">
				<div className="form-group">
					<label>Source</label>
					<select value={sourceId} onChange={(e) => setSourceId(e.target.value)} required>
						<option value="">Select...</option>
						{sources.map(source => (
							<option key={source.id} value={source.id}>{source.title}</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label>Page</label>
					<input type="text" value={page} onChange={(e) => setPage(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Line Number</label>
					<input type="text" value={lineNumber} onChange={(e) => setLineNumber(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Name as Recorded</label>
					<input type="text" value={nameAsRecorded} onChange={(e) => setNameAsRecorded(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Transcription</label>
					<textarea value={transcription} onChange={(e) => setTranscription(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Notes</label>
					<textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
				</div>
				<div className="button-row">
					<button type="submit">Save Citation</button>
					<Link to={`/people/${personId}`}><button type="button">Cancel</button></Link>
				</div>
			</form>
		</div>
	);
}

export default CitationForm;