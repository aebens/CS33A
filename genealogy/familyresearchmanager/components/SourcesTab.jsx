import React, { useState } from 'react';

function SourcesTab({ sources, setSources, sourceCreators, getCreatorTitle, refreshData }) {
	// Form visibility
	const [showSourceForm, setShowSourceForm] = useState(false);

	// Form state
	const [sourceCreatorId, setSourceCreatorId] = useState('');
	const [sourceTitle, setSourceTitle] = useState('');
	const [sourceDate, setSourceDate] = useState('');
	const [sourceIdentifier, setSourceIdentifier] = useState('');
	const [sourceNotes, setSourceNotes] = useState('');
	const [sourcePageNumber, setSourcePageNumber] = useState('');
	const [sourceUrl, setSourceUrl] = useState('');
	const [sourceFile, setSourceFile] = useState(null);

	// Editing state
	const [editingSourceId, setEditingSourceId] = useState(null);

	// Add handler
	const handleAddSource = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('source_creator', sourceCreatorId);
		formData.append('title', sourceTitle);
		formData.append('date', sourceDate);
		formData.append('item_identifier', sourceIdentifier);
		formData.append('page_number', sourcePageNumber);
		formData.append('url', sourceUrl);
		formData.append('notes', sourceNotes);
		if (sourceFile) formData.append('file', sourceFile);

		const res = await fetch('/api/sources/', {
			method: 'POST',  
			body: formData
		});
		const saved = await res.json();
		setSources([...sources, saved]);
		setSourceCreatorId(''); setSourceTitle(''); setSourceDate(''); setSourceIdentifier('');
		setSourcePageNumber(''); setSourceUrl(''); setSourceNotes(''); setSourceFile(null);
		setShowSourceForm(false);
	};

	// Start edit
	const startEditSource = (source) => {
		setSourceCreatorId(source.source_creator);
		setSourceTitle(source.title);
		setSourceDate(source.date || '');
		setSourceIdentifier(source.item_identifier || '');
		setSourceNotes(source.notes || '');
		setEditingSourceId(source.id);
		setShowSourceForm(false);
		setSourcePageNumber(source.page_number || '');
		setSourceUrl(source.url || '');
	};

	// Update handler
	const handleUpdateSource = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('source_creator', sourceCreatorId);
		formData.append('title', sourceTitle);
		formData.append('date', sourceDate);
		formData.append('item_identifier', sourceIdentifier);
		formData.append('page_number', sourcePageNumber);
		formData.append('url', sourceUrl);
		formData.append('notes', sourceNotes);
		if (sourceFile) formData.append('file', sourceFile);

		const res = await fetch(`/api/sources/${editingSourceId}/`, {
			method: 'PATCH', // necessary for file updating
			body: formData
		});
		const updated = await res.json();
		setSources(sources.map(s => s.id === editingSourceId ? updated : s));
		setSourceCreatorId(''); setSourceTitle(''); setSourceDate(''); setSourceIdentifier('');
		setSourcePageNumber(''); setSourceUrl(''); setSourceNotes(''); setSourceFile(null);
		setEditingSourceId(null);
	};

	// Cancel edit
	const cancelEditSource = () => {
		setSourceCreatorId(''); setSourceTitle(''); setSourceDate(''); setSourceIdentifier(''); setSourceNotes('');
		setEditingSourceId(null); setSourcePageNumber(''); setSourceUrl(''); setSourceFile(null);
	};

	// Delete handler
	const handleDeleteSource = async (id) => {
		if (!window.confirm('Delete this source? All related research log entries will also be deleted.')) {
			return;
		}
		await fetch(`/api/sources/${id}/`, { method: 'DELETE' });
		refreshData(); // Refresh all data to sync cascaded deletes
	};

	return (
		<section className="family-list">
			<h2>Sources</h2>
			<p>Sources are more specific items within a collection, such as a page, but this does not include an individual piece of information.
				This allows you to reuse this entry as you cite the information multiple times for various facts or individuals. Line item 
				information is kept in the research log.</p>
			{sources.length > 0 ? (
				<ul>
					{sources.map(source => (
						<li key={source.id}>
							<strong>{source.title}</strong>
							{source.date && ` (${source.date})`}
							{source.item_identifier && ` - ${source.item_identifier}`}
							<span> (Collection: {getCreatorTitle(source.source_creator)})</span>
							{source.file && (
							<div className="file-preview">
								<a href={source.file} target="_blank" rel="noopener noreferrer">
									{source.file.split('/').pop()}
								</a>
								<img
									src={source.file}
									alt="attachment"
									className="file-thumbnail"
								/>
							</div>
						)}
							<button className="edit-btn" onClick={() => startEditSource(source)}>Edit</button>
							<button className="delete-btn" onClick={() => handleDeleteSource(source.id)}>Delete</button>
						</li>
					))}
				</ul>
			) : (
				<p className="empty-message">No sources yet.</p>
			)}

			{showSourceForm || editingSourceId ? (
				<form onSubmit={editingSourceId ? handleUpdateSource : handleAddSource} className="family-form">
					<div className="form-group">
						<label>Source Creator</label>
						<select value={sourceCreatorId} onChange={(e) => setSourceCreatorId(e.target.value)} required>
							<option value="">Select...</option>
							{sourceCreators.map(creator => (
								<option key={creator.id} value={creator.id}>{creator.title}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Title</label>
						<input type="text" value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} required />
					</div>
					<div className="form-group">
						<label>Date</label>
						<input type="text" value={sourceDate} onChange={(e) => setSourceDate(e.target.value)} placeholder="e.g., 1920" />
					</div>
					<div className="form-group">
						<label>Item Identifier</label>
						<input type="text" value={sourceIdentifier} onChange={(e) => setSourceIdentifier(e.target.value)} placeholder="e.g., Roll 123, ED 45" />
					</div>
					<div className="form-group">
						<label>Page Number</label>
						<input type="text" value={sourcePageNumber} onChange={(e) => setSourcePageNumber(e.target.value)} />
					</div>
					<div className="form-group">
						<label>URL</label>
						<input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
					</div>
					<div className="form-group">
						<label>File/Image</label>
						<input type="file" onChange={(e) => setSourceFile(e.target.files[0])} />
					</div>
					<div className="form-group">
						<label>Notes</label>
						<textarea value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} />
					</div>
					<div className="button-row">
						<button type="submit">{editingSourceId ? 'Save' : 'Add Source'}</button>
						<button type="button" onClick={editingSourceId ? cancelEditSource : () => setShowSourceForm(false)}>Cancel</button>
					</div>
				</form>
			) : (
				<button onClick={() => setShowSourceForm(true)} disabled={sourceCreators.length === 0}>
					Add Source
				</button>
			)}
		</section>
	);
}

export default SourcesTab;