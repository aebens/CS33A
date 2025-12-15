import React, { useState } from 'react';

function RepositoriesTab({ repositories, setRepositories, REPO_TYPES, refreshData }) {
	// Form visibility
	const [showRepoForm, setShowRepoForm] = useState(false);

	// Form state
	const [repoName, setRepoName] = useState('');
	const [repoType, setRepoType] = useState('');
	const [repoAddress, setRepoAddress] = useState('');
	const [repoWebsite, setRepoWebsite] = useState('');
	const [repoNotes, setRepoNotes] = useState('');

	// Editing state
	const [editingRepoId, setEditingRepoId] = useState(null);

	// Add handler
	const handleAddRepo = async (e) => {
		e.preventDefault();
		const res = await fetch('/api/repositories/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: repoName,
				repo_type: repoType,
				address: repoAddress,
				website: repoWebsite,
				notes: repoNotes
			})
		});
		const saved = await res.json();
		setRepositories([...repositories, saved]);
		setRepoName(''); setRepoType(''); setRepoAddress(''); setRepoWebsite(''); setRepoNotes('');
		setShowRepoForm(false);
	};

	// Start edit
	const startEditRepo = (repo) => {
		setRepoName(repo.name);
		setRepoType(repo.repo_type);
		setRepoAddress(repo.address || '');
		setRepoWebsite(repo.website || '');
		setRepoNotes(repo.notes || '');
		setEditingRepoId(repo.id);
		setShowRepoForm(false);
	};

	// Update handler
	const handleUpdateRepo = async (e) => {
		e.preventDefault();
		const res = await fetch(`/api/repositories/${editingRepoId}/`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: repoName,
				repo_type: repoType,
				address: repoAddress,
				website: repoWebsite,
				notes: repoNotes
			})
		});
		const updated = await res.json();
		setRepositories(repositories.map(r => r.id === editingRepoId ? updated : r));
		setRepoName(''); setRepoType(''); setRepoAddress(''); setRepoWebsite(''); setRepoNotes('');
		setEditingRepoId(null);
	};

	// Cancel edit
	const cancelEditRepo = () => {
		setRepoName(''); setRepoType(''); setRepoAddress(''); setRepoWebsite(''); setRepoNotes('');
		setEditingRepoId(null);
	};

	// Delete handler
	const handleDeleteRepo = async (id) => {
		if (!window.confirm('Delete this repository? All related collections, sources, and research log entries will also be deleted.')) {
			return;
		}
		await fetch(`/api/repositories/${id}/`, { method: 'DELETE' });
		refreshData(); // Refresh all data to sync cascaded deletes
	};

	return (
		<section className="family-list">
			<h2>Repositories</h2>
			{repositories.length > 0 ? (
				<ul>
					{repositories.map(repo => (
						<li key={repo.id}>
							<strong>{repo.name}</strong> ({REPO_TYPES.find(t => t[0] === repo.repo_type)?.[1]})
							{repo.website && <span> - <a href={repo.website} target="_blank">Website</a></span>}
							<button className="edit-btn" onClick={() => startEditRepo(repo)}>Edit</button>
							<button className="delete-btn" onClick={() => handleDeleteRepo(repo.id)}>Delete</button>
						</li>
					))}
				</ul>
			) : (
				<p className="empty-message">No repositories yet.</p>
			)}

			{showRepoForm || editingRepoId ? (
				<form onSubmit={editingRepoId ? handleUpdateRepo : handleAddRepo} className="family-form">
					<div className="form-group">
						<label>Name</label>
						<input type="text" value={repoName} onChange={(e) => setRepoName(e.target.value)} required />
					</div>
					<div className="form-group">
						<label>Type</label>
						<select value={repoType} onChange={(e) => setRepoType(e.target.value)} required>
							<option value="">Select...</option>
							{REPO_TYPES.map(([value, label]) => (
								<option key={value} value={value}>{label}</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Address</label>
						<textarea value={repoAddress} onChange={(e) => setRepoAddress(e.target.value)} />
					</div>
					<div className="form-group">
						<label>Website</label>
						<input type="url" value={repoWebsite} onChange={(e) => setRepoWebsite(e.target.value)} />
					</div>
					<div className="form-group">
						<label>Notes</label>
						<textarea value={repoNotes} onChange={(e) => setRepoNotes(e.target.value)} />
					</div>
					<div className="button-row">
						<button type="submit">{editingRepoId ? 'Save' : 'Add Repository'}</button>
						<button type="button" onClick={editingRepoId ? cancelEditRepo : () => setShowRepoForm(false)}>Cancel</button>
					</div>
				</form>
			) : (
				<button onClick={() => setShowRepoForm(true)}>Add Repository</button>
			)}
		</section>
	);
}

export default RepositoriesTab;