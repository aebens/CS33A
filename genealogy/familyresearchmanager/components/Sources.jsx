import React, { useState, useEffect } from 'react';
import RepositoriesTab from './RepositoriesTab';
import CollectionsTab from './CollectionsTab';
import SourcesTab from './SourcesTab';
import ResearchLogTab from './ResearchLogTab';

const REPO_TYPES = [
	['archive', 'Archive/Library'],
	['courthouse', 'Courthouse'],
	['church', 'Church/Religious'],
	['website', 'Website/Database'],
	['personal', 'Personal Collection'],
];

function Sources() {
	// Data state (shared across the tabs)
	const [repositories, setRepositories] = useState([]);
	const [sourceCreators, setSourceCreators] = useState([]);
	const [sources, setSources] = useState([]);
	const [sourceAccesses, setSourceAccesses] = useState([]);

	// Tab navigation state
	const [activeTab, setActiveTab] = useState('repositories');

  // Refresh all data (used after delete)
  const refreshData = () => {
	fetch('/api/repositories/')
    .then(res => res.json())
    .then(setRepositories);
	fetch('/api/source-creators/')
    .then(res => res.json())
    .then(setSourceCreators);
	fetch('/api/sources/')
    .then(res => res.json())
    .then(setSources);
	fetch('/api/source-accesses/')
    .then(res => res.json())
    .then(setSourceAccesses);
};

	// Fetch all data
	useEffect(() => {
		fetch('/api/repositories/')
			.then(res => res.json())
			.then(data => setRepositories(data));

		fetch('/api/source-creators/')
			.then(res => res.json())
			.then(data => setSourceCreators(data));

		fetch('/api/sources/')
			.then(res => res.json())
			.then(data => setSources(data));

		fetch('/api/source-accesses/')
			.then(res => res.json())
			.then(data => setSourceAccesses(data));
	}, []);

	// Helper functions
	const getRepoName = (id) => repositories.find(r => r.id === id)?.name || 'Unknown';
	const getCreatorTitle = (id) => sourceCreators.find(c => c.id === id)?.title || 'Unknown';
	const getSourceTitle = (id) => sources.find(s => s.id === id)?.title || 'Unknown';

	return (
		<div className="app">
			<h1>Sources</h1>

			<div className="source-tabs">
				<button
					className={activeTab === 'repositories' ? 'active' : ''}
					onClick={() => setActiveTab('repositories')}>
					Repositories
				</button>
				<button
					className={activeTab === 'collections' ? 'active' : ''}
					onClick={() => setActiveTab('collections')}>
					Collections
				</button>
				<button
					className={activeTab === 'sources' ? 'active' : ''}
					onClick={() => setActiveTab('sources')}>
					Sources
				</button>
				<button
					className={activeTab === 'research-log' ? 'active' : ''}
					onClick={() => setActiveTab('research-log')}>
					Research Log
				</button>
			</div>

			{activeTab === 'repositories' && (
				<RepositoriesTab
					repositories={repositories}
					setRepositories={setRepositories}
					REPO_TYPES={REPO_TYPES}
          refreshData={refreshData}
				/>
			)}

			{activeTab === 'collections' && (
				<CollectionsTab
					sourceCreators={sourceCreators}
					setSourceCreators={setSourceCreators}
					repositories={repositories}
					getRepoName={getRepoName}
          refreshData={refreshData}
				/>
			)}

			{activeTab === 'sources' && (
				<SourcesTab
					sources={sources}
					setSources={setSources}
					sourceCreators={sourceCreators}
					getCreatorTitle={getCreatorTitle}
          refreshData={refreshData}
				/>
			)}

			{activeTab === 'research-log' && (
				<ResearchLogTab
					sourceAccesses={sourceAccesses}
					setSourceAccesses={setSourceAccesses}
					sources={sources}
					repositories={repositories}
					getSourceTitle={getSourceTitle}
					getRepoName={getRepoName}
          refreshData={refreshData}
				/>
			)}
		</div>
	);
}

export default Sources;