import React, { useState } from 'react';

function ResearchLogTab({ sourceAccesses, setSourceAccesses, sources, repositories, getSourceTitle, getRepoName, refreshData }) {
	// Form visibility
	const [showAccessForm, setShowAccessForm] = useState(false);

    // Helper to get today's date in YYYY-MM-DD format
    const getTodayDate = () => new Date().toISOString().split('T')[0];

	// Form state
	const [accessSource, setAccessSource] = useState('');
	const [accessRepo, setAccessRepo] = useState('');
	const [accessDate, setAccessDate] = useState(getTodayDate());
	const [accessUrl, setAccessUrl] = useState('');
	const [accessNotes, setAccessNotes] = useState('');
    const [accessPersonName, setAccessPersonName] = useState('');
    const [accessLineNumber, setAccessLineNumber] = useState('');
    const [accessFile, setAccessFile] = useState(null);

	// Editing state
	const [editingAccessId, setEditingAccessId] = useState(null);

	// Add handler
	const handleAddAccess = async (e) => {
		e.preventDefault();
        const formData = new FormData();
        formData.append('source', accessSource);
        formData.append('repository', accessRepo);
        formData.append('access_date', accessDate);
        formData.append('person_name', accessPersonName);
        formData.append('line_number', accessLineNumber);
        formData.append('url', accessUrl);
        formData.append('notes', accessNotes);
        if (accessFile) formData.append('file', accessFile);

        const res = await fetch('/api/source-accesses/', {
            method: 'POST',
            body: formData
        });
        const saved = await res.json();
        setSourceAccesses([...sourceAccesses, saved]);
        setAccessSource(''); setAccessRepo(''); setAccessDate(getTodayDate()); setAccessUrl('');
        setAccessPersonName(''); setAccessLineNumber(''); setAccessNotes(''); setAccessFile(null);
        setShowAccessForm(false);
    };

	// Start edit
	const startEditAccess = (access) => {
		setAccessSource(access.source);
        setAccessRepo(access.repository);
        setAccessDate(access.access_date || '');
        setAccessUrl(access.url || '');
        setAccessPersonName(access.person_name || '');
        setAccessLineNumber(access.line_number || '');
        setAccessNotes(access.notes || '');
        setEditingAccessId(access.id);
        setShowAccessForm(false);
    };

	// Update handler
	const handleUpdateAccess = async (e) => {
		e.preventDefault();
        const formData = new FormData();
        formData.append('source', accessSource);
        formData.append('repository', accessRepo);
        formData.append('access_date', accessDate);
        formData.append('person_name', accessPersonName);
        formData.append('line_number', accessLineNumber);
        formData.append('url', accessUrl);
        formData.append('notes', accessNotes);
        if (accessFile) formData.append('file', accessFile);

        const res = await fetch(`/api/source-accesses/${editingAccessId}/`, {
            method: 'PATCH', // this is needed for the files so that they aren't replaced with null on update
            body: formData
        });
        const updated = await res.json();
        setSourceAccesses(sourceAccesses.map(a => a.id === editingAccessId ? updated : a));
        setAccessSource(''); setAccessRepo(''); setAccessDate(getTodayDate()); setAccessUrl('');
        setAccessPersonName(''); setAccessLineNumber(''); setAccessNotes(''); setAccessFile(null);
        setEditingAccessId(null);
    };

	// Cancel edit
	const cancelEditAccess = () => {
		setAccessSource(''); setAccessRepo(''); setAccessDate(getTodayDate()); setAccessUrl('');
        setAccessPersonName(''); setAccessLineNumber(''); setAccessNotes(''); setAccessFile(null);
        setEditingAccessId(null);
    };

	// Delete handler
	const handleDeleteAccess = async (id) => {
        if (!window.confirm('Delete this research log entry?')) {
            return;
        }
		await fetch(`/api/source-accesses/${id}/`, { method: 'DELETE' });
		refreshData(); // Refresh all data to sync cascaded deletes
	};

	return (
		<section className="family-list">
			<h2>Research Log</h2>
			<p>This is where specific citation data is entered along with the date it was accessed. By cataloging both positive and 
				negative search results you will remember more easily which parts of your research plan have not yet been implemented.</p>
			{sourceAccesses.length > 0 ? (
				<ul>
					{sourceAccesses.map(access => (
						<li key={access.id}>
                            <strong>{getSourceTitle(access.source)}</strong>
                            <span> via {getRepoName(access.repository)}</span>
                            {access.access_date && ` on ${access.access_date}`}
                            {access.url && <span> - <a href={access.url} target="_blank">Link</a></span>}
                            {access.file && (
                                <div className="file-preview">
                                    <a href={access.file} target="_blank" rel="noopener noreferrer">
                                        {access.file.split('/').pop()}
                                    </a>
                                    <img
                                        src={access.file}
                                        alt="attachment"
                                        className="file-thumbnail"
                                    />
                                </div>
                            )}
                            <button className="edit-btn" onClick={() => startEditAccess(access)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteAccess(access.id)}>Delete</button>
                        </li>
					))}
				</ul>
			) : (
				<p className="empty-message">No access records yet.</p>
			)}

			{showAccessForm || editingAccessId ? (
				<form onSubmit={editingAccessId ? handleUpdateAccess : handleAddAccess} className="family-form">
					<div className="form-group">
						<label>Source</label>
						<select value={accessSource} onChange={(e) => setAccessSource(e.target.value)} required>
							<option value="">Select...</option>
							{sources.map(source => (
								<option key={source.id} value={source.id}>{source.title}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Accessed Via (Repository)</label>
						<select value={accessRepo} onChange={(e) => setAccessRepo(e.target.value)} required>
							<option value="">Select...</option>
							{repositories.map(repo => (
								<option key={repo.id} value={repo.id}>{repo.name}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Access Date</label>
						<input type="date" value={accessDate} onChange={(e) => setAccessDate(e.target.value)} />
					</div>
					<div className="form-group">
						<label>URL</label>
						<input type="url" value={accessUrl} onChange={(e) => setAccessUrl(e.target.value)} />
					</div>
                    <div className="form-group">
                        <label>Person Name</label>
                        <input type="text" value={accessPersonName} onChange={(e) => setAccessPersonName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Line Number</label>
                        <input type="text" value={accessLineNumber} onChange={(e) => setAccessLineNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>File/Image</label>
                        <input type="file" onChange={(e) => setAccessFile(e.target.files[0])} />
                    </div>
					<div className="form-group">
						<label>Notes</label>
						<textarea value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} />
					</div>
					<div className="button-row">
						<button type="submit">{editingAccessId ? 'Save' : 'Add Access Record'}</button>
						<button type="button" onClick={editingAccessId ? cancelEditAccess : () => setShowAccessForm(false)}>Cancel</button>
					</div>
				</form>
			) : (
				<button onClick={() => setShowAccessForm(true)} disabled={sources.length === 0 || repositories.length === 0}>
					Add Access Record
				</button>
			)}
		</section>
	);
}

export default ResearchLogTab;