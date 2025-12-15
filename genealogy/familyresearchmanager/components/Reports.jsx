import React, { useState, useEffect } from 'react';

const Reports = () => {
    const [sources, setSources] = useState([]);
    const [collections, setCollections] = useState([]);
    const [repositories, setRepositories] = useState([]);
    const [researchLogs, setResearchLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [sourcesRes, collectionsRes, repositoriesRes, researchLogsRes] = await Promise.all([
                fetch('/api/sources/'),
                fetch('/api/source-creators/'),
                fetch('/api/repositories/'),
                fetch('/api/source-accesses/')
            ]);

            const sourcesData = await sourcesRes.json();
            const collectionsData = await collectionsRes.json();
            const repositoriesData = await repositoriesRes.json();
            const researchLogsData = await researchLogsRes.json();

            setSources(sourcesData);
            setCollections(collectionsData);
            setRepositories(repositoriesData);
            setResearchLogs(researchLogsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Create citation for the source report

    const formatEvidenceExplained = (source, repository = null, sourceCreator = null) => {
        let citation = '';
        
        // Start with date
        if (source.date) {
            citation += `${source.date} `;
        }
        
        // Add source creator title (the collection/source type)
        if (sourceCreator?.title) {
            citation += `${sourceCreator.title}`;
        }
        
        // Add item identifier if available
        if (source.item_identifier) {
            citation += `, ${source.item_identifier}`;
        }
        
        // Add page numbers
        if (source.page_number) {
            citation += `, page ${source.page_number}`;
        }
        
        // Add the specific source title
        if (source.title) {
            citation += `; "${source.title}"`;
        }
        
        // Add source creator author and publication info
        if (sourceCreator?.author) {
            citation += `, by ${sourceCreator.author}`;
        }
        
        if (sourceCreator?.publication_info) {
            citation += `, ${sourceCreator.publication_info}`;
        }
        
        // Add repository information
        if (repository) {
            citation += ` (${repository.name}`;
            if (repository.address) {
                citation += `, ${repository.address}`;
            }
            citation += ')';
        }
        
        // Add URL
        if (source.url) {
            citation += `; ${source.url}`;
        }
        
        return citation + '.';
    };

    const filterSources = (sources) => {
    if (!searchTerm.trim()) return sources;
    
    // Filter function to look through the different fields for a word
    const searchLower = searchTerm.toLowerCase();
        return sources.filter(source => 
            (source.title && source.title.toLowerCase().includes(searchLower)) ||
            (source.notes && source.notes.toLowerCase().includes(searchLower)) ||
            (source.date && source.date.toLowerCase().includes(searchLower)) ||
            (source.sourceCreatorInfo?.title && source.sourceCreatorInfo.title.toLowerCase().includes(searchLower)) ||
            (source.sourceCreatorInfo?.author && source.sourceCreatorInfo.author.toLowerCase().includes(searchLower))
        );
    };

    // Group the sources so that it's easy to see what is used by a given creator.

    const groupSourcesByCollection = () => {
        const grouped = {};
        
        sources.forEach(source => {
            const sourceCreatorId = source.source_creator;
            
            let collectionName;
            let sourceCreatorInfo = null;
            
            if (sourceCreatorId) {
                sourceCreatorInfo = collections.find(c => c.id === sourceCreatorId);
                collectionName = sourceCreatorInfo?.title || `Unknown Collection (ID: ${sourceCreatorId})`;
            } else {
                collectionName = "Uncategorized Sources";
            }
            
            if (!grouped[collectionName]) {
                grouped[collectionName] = [];
            }
            
            const repository = repositories.find(r => r.id === source.repository);
            const relatedResearchLogs = researchLogs.filter(log => log.source === source.id);
            
            grouped[collectionName].push({
                ...source,
                repositoryInfo: repository,
                sourceCreatorInfo: sourceCreatorInfo,
                researchLogEntries: relatedResearchLogs
            });
        });

        // Filter each collection's sources
        Object.keys(grouped).forEach(collectionName => {
            grouped[collectionName] = filterSources(grouped[collectionName]);
        });
        
        // Remove empty collection headings after filtering
        Object.keys(grouped).forEach(collectionName => {
            if (grouped[collectionName].length === 0) {
                delete grouped[collectionName];
            }
        });
        
        return grouped;
    };

    if (loading) {
        return <div>Loading reports...</div>;
    }

    const groupedSources = groupSourcesByCollection();
    const sortedCollections = Object.keys(groupedSources).sort();

    return (
        <div className="reports-container">
            <h1>Sources Report</h1>
            <p className="report-subtitle">This report provides a list of all collections and the sources in this database within each collection.</p>
            
             {/* Search for citations */}
            <div className="form-group">
                <label>Search</label>
                <input
                    type="text"
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="source-report">
                {sortedCollections.map(collectionName => (
                    <div key={collectionName} className="collection-section">
                        <h2 className="collection-header">{collectionName}</h2>
                        <ol className="sources-list">
                            {groupedSources[collectionName]
                                // Alphabetizes the collection names
                                .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
                                .map(source => (
                                    <li key={source.id} className="source-item">
                                        <div className="citation-text">
                                            {formatEvidenceExplained(source, source.repositoryInfo, source.sourceCreatorInfo)}
                                        </div>
                                        
                                        {source.notes && (
                                            <div className="source-notes">
                                                <strong>Source Notes:</strong> {source.notes}
                                            </div>
                                        )}
                                        
                                        {source.sourceCreatorInfo?.notes && (
                                            <div className="source-creator-notes">
                                                <strong>Collection Notes:</strong> {source.sourceCreatorInfo.notes}
                                            </div>
                                        )}
                                    </li>
                                ))
                            }
                        </ol>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;