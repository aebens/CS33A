# Family Research Manager

Family Research Manager is a genealogical application to track data about people and the events in their lives.  It focuses on alleviating data entry associated with source citations -- a task that is difficult with current software.

## Genealogy Software - A Problem Statement:
The current state of genealogy software suffers from two major problems:

1. Most software is desktop-based and runs as standalone applications, making them difficult to update over time.  Because of this, many software have not been meaningfully updated in decades.
2. Similarly, the aging data transfer standard, GEDCOM, has not been meaningfully updated since 1999.  This means that most modern database methods are not employed in genealogy software.

A key area where this becomes problematic is with the use of source citations.

Family Research Manager also combines two features that are currently not available in any genealogical softare:  a web application that does not require cloud-based software.  One of the key features that many genealogists look for is the ability to run their own software without being tied to a paid service (e.g., Ancestry.com).  This is currently why desktop software is the most common form of software for professional genealogists.  By allowing the user to run a local server (no login required), the user is given the benefit of the modern web application without any additional cost or privacy concerns.

## Citations:  State of the Genealogy World

Source citations are considered one of the most important pieces of genealogy, and understanding and analyzing them separates amateurs and professionals.  Unfortunately, current genealogy software does not take this part of data management and collection seriously enough.  Specifically there is no ability to layer citations in normal form, a best practice in database management.  This means that data is entered in repeatedly for every new citation of the same source.

In some cases, a source like a census could be cited thousands of time and thus full entries are re-entered each time.  With a normalized database, the basic information about this source (a census) would be entered only once.  Any updates to that source would cascade to all the citations.  Deletions of the source would also cascade to ensure no orphaned citations.

Family Research Manager addresses these gaps by implementing a citation system designed around modern genealogical best practices in combination with modern database design methodologies.


## Features

### People & Events
- Add individuals to your family tree with given and last names
- Record life events (birth, death, marriage, census, military service, etc.) with dates, locations, and notes
- Link events to source citations for evidence-based research

### Hierarchical Source Management
Following the *Evidence Explained* methodology, sources are organized in a four-level hierarchy:

1. **Repositories** - Where sources are stored (archives, libraries, websites, courthouses, churches, personal collections)
2. **Collections/Source Creators** - Larger works containing multiple sources (e.g., "1850 U.S. Census")
3. **Sources** - Specific items within a collection (e.g., a particular census page)
4. **Research Log (Source Access)** - When and how you accessed each source, including findings
5. **Citations** - The specific link between an event and a source.

This allows the user to manage "citation layers" as mentioned by *Evidence Explained*.

### Citation System
- Link citations to specific life events
- Record page numbers, line numbers, and how names appear in original documents
- Add transcriptions and research notes
- Support for file attachments (images, documents) in both the sources and the research log.  Importantly, placing the image at the source level and not the citation reduces the number of images that need to be uploaded.  One file can then be referenced an infinite number of times.

### Reports

- A source report is available to group existing sources together for easy review and to assess further research questions.

### Search
- A letter by letter search feature is available for both people and the source report.

Unlike today's genealogical software, the user is not required to search in a specific field.  All fields are searched equally.

### Why Separate Research Log from Sources?
The Research Log (SourceAccess model) tracks *when* a user accessed a source and *what* was found. This is distinct from the source itself. The research log captures this research process.

## Usage Workflow

1. **Add People** - Create individuals in your family tree
2. **Record Events** - Add birth, death, marriage, and other life events
3. **Create Repositories** - Add locations where you find sources (archives, websites)
4. **Create Collections** - Add larger works within repositories
5. **Create Sources** - Add specific items within collections
6. **Log Research** - Record when you access sources and what you find
7. **Create Citations** - Link your events to the sources that prove them
8. **Generate Reports** - View formatted citations for your research

## Project Structure

```
genealogy/
├── familyresearchmanager/          # Main Django app
│   ├── components/                 # React components
│   │   ├── NavBar.jsx              # Navigation bar
│   │   ├── PersonProfile.jsx       # Individual person view
│   │   ├── Sources.jsx             # Source management (tabbed)
│   │   ├── CitationForm.jsx        # Create citations
│   │   ├── Reports.jsx             # Citation reports
│   │   ├── RepositoriesTab.jsx     # Repository management
│   │   ├── CollectionsTab.jsx      # Collection management
│   │   ├── SourcesTab.jsx          # Source item management
│   │   └── ResearchLogTab.jsx      # Research log entries
│   ├── src/
│   │   └── App.jsx                 # Main React app with routing
│   │   └── index.jsx               # Inserts React app into index.html
│   ├── static/                     # Compiled assets and CSS
│   ├── templates/                  # Django templates, index
│   ├── models.py                   # Database models
│   ├── views.py                    # API viewsets
│   ├── serializers.py              # REST API serializers
│   └── urls.py                     # URL routing
├── genealogy/                      # Django project settings
├── media/                          # User-uploaded files for sources
└── manage.py
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/people/` | Manage individuals |
| `/api/events/` | Manage life events for individuals |
| `/api/repositories/` | Manage source repositories |
| `/api/source-creators/` | Manage collections |
| `/api/sources/` | Manage specific sources |
| `/api/source-accesses/` | Manage research log entries |
| `/api/citations/` | Manage citations |