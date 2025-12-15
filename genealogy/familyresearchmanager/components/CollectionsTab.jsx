import React, { useState } from 'react';

function CollectionsTab({ sourceCreators, setSourceCreators, repositories, getRepoName, refreshData }) {
	// Form visibility
	const [showCreatorForm, setShowCreatorForm] = useState(false);

	// Form state
	const [creatorRepo, setCreatorRepo] = useState('');
	const [creatorTitle, setCreatorTitle] = useState('');
	const [creatorAuthor, setCreatorAuthor] = useState('');
	const [creatorPubInfo, setCreatorPubInfo] = useState('');
	const [creatorNotes, setCreatorNotes] = useState('');

	// Editing state
	const [editingCreatorId, setEditingCreatorId] = useState(null);

	// Add handler
	const handleAddCreator = async (e) => {
		e.preventDefault();
		const res = await fetch('/api/source-creators/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				repository: creatorRepo,
				title: creatorTitle,
				author: creatorAuthor,
				publication_info: creatorPubInfo,
				notes: creatorNotes
			})
		});
		const saved = await res.json();
		setSourceCreators([...sourceCreators, saved]);
		setCreatorRepo(''); setCreatorTitle(''); setCreatorAuthor(''); setCreatorPubInfo(''); setCreatorNotes('');
		setShowCreatorForm(false);
	};

	// Start edit
	const startEditCreator = (creator) => {
		setCreatorRepo(creator.repository);
		setCreatorTitle(creator.title);
		setCreatorAuthor(creator.author || '');
		setCreatorPubInfo(creator.publication_info || '');
		setCreatorNotes(creator.notes || '');
		setEditingCreatorId(creator.id);
		setShowCreatorForm(false);
	};

	// Update handler
	const handleUpdateCreator = async (e) => {
		e.preventDefault();
		const res = await fetch(`/api/source-creators/${editingCreatorId}/`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				repository: creatorRepo,
				title: creatorTitle,
				author: creatorAuthor,
				publication_info: creatorPubInfo,
				notes: creatorNotes
			})
		});
		const updated = await res.json();
		setSourceCreators(sourceCreators.map(c => c.id === editingCreatorId ? updated : c));
		setCreatorRepo(''); setCreatorTitle(''); setCreatorAuthor(''); setCreatorPubInfo(''); setCreatorNotes('');
		setEditingCreatorId(null);
	};

	// Cancel edit
	const cancelEditCreator = () => {
		setCreatorRepo(''); setCreatorTitle(''); setCreatorAuthor(''); setCreatorPubInfo(''); setCreatorNotes('');
		setEditingCreatorId(null);
	};

	// Delete handler
	const handleDeleteCreator = async (id) => {
		if (!window.confirm('Delete this collection? All related sources and research log entries will also be deleted.')) {
			return;
		}
		await fetch(`/api/source-creators/${id}/`, { method: 'DELETE' });
		refreshData(); // Refresh all data to sync cascaded deletes
	};

	return (
		<section className="family-list">
			<h2>Collections</h2>
			<p>The top level name of the source. Who created the source regardless of where you found it? 
				This is typically a larger work that has many citations in it, such as census, book, or database.</p>
			{sourceCreators.length > 0 ? (
				<ul>
					{sourceCreators.map(creator => (
						<li key={creator.id}>
							<strong>{creator.title}</strong>
							{creator.author && ` by ${creator.author}`}
							<span> (Repository: {getRepoName(creator.repository)})</span>
							<button className="edit-btn" onClick={() => startEditCreator(creator)}>Edit</button>
							<button className="delete-btn" onClick={() => handleDeleteCreator(creator.id)}>Delete</button>
						</li>
					))}
				</ul>
			) : (
				<p className="empty-message">No source creators yet.</p>
			)}

			{showCreatorForm || editingCreatorId ? (
				<form onSubmit={editingCreatorId ? handleUpdateCreator : handleAddCreator} className="family-form">
					<div className="form-group">
						<label>Repository</label>
						<select value={creatorRepo} onChange={(e) => setCreatorRepo(e.target.value)} required>
							<option value="">Select...</option>
							{repositories.map(repo => (
								<option key={repo.id} value={repo.id}>{repo.name}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Title</label>
						<input type="text" value={creatorTitle} onChange={(e) => setCreatorTitle(e.target.value)} required />
					</div>
					<div className="form-group">
						<label>Author</label>
						<input type="text" value={creatorAuthor} onChange={(e) => setCreatorAuthor(e.target.value)} />
					</div>
					<div className="form-group">
						<label>Publication Info</label>
						<textarea value={creatorPubInfo} onChange={(e) => setCreatorPubInfo(e.target.value)} />
					</div>
					<div className="form-group">
						<label>Notes</label>
						<textarea value={creatorNotes} onChange={(e) => setCreatorNotes(e.target.value)} />
					</div>
					<div className="button-row">
						<button type="submit">{editingCreatorId ? 'Save' : 'Add Collection'}</button>
						<button type="button" onClick={editingCreatorId ? cancelEditCreator : () => setShowCreatorForm(false)}>Cancel</button>
					</div>
				</form>
			) : (
				<button onClick={() => setShowCreatorForm(true)} disabled={repositories.length === 0}>
					Add Collection
				</button>
			)}
		</section>
	);
}

export default CollectionsTab;