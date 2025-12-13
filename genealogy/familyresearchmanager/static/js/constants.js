// Default event types (date focused fact)
const defaultEventTypes = [
  {id: 1, name: 'Birth', category: 'Vital'},
  {id: 2, name: 'Death', category: 'Vital'},
  {id: 3, name: 'Christening', category: 'Vital'},
  {id: 4, name: 'Burial', category: 'Vital'},
  {id: 5, name: 'Marriage', category: 'Family'},
  {id: 6, name: 'Divorce', category: 'Family'},
  {id: 7, name: 'Engagement', category: 'Family'},
  {id: 8, name: 'Residence', category: 'Residence'},
  {id: 9, name: 'Immigration', category: 'Residence'},
  {id: 10, name: 'Emigration', category: 'Residence'},
  {id: 11, name: 'Census', category: 'Other'},
  {id: 12, name: 'Military Service', category: 'Other'},
  {id: 13, name: 'Education', category: 'Other'},
];

// Default attribute types (description focused fact)
const defaultAttributeTypes = [
  {id: 1, name: 'Occupation'},
  {id: 2, name: 'Religion'},
  {id: 3, name: 'Language'},
  {id: 4, name: 'Education'},
  {id: 5, name: 'Nationality'},
  {id: 6, name: 'Ethnicity'},
  {id: 7, name: 'Physical Description'},
  {id: 8, name: 'Military Service'},
];

// Default repositories
const defaultRepositories = [
  {id: 1, name: 'National Archives and Records Administration (NARA)', type: 'archive', location: 'Washington, D.C., USA', website: 'https://www.archives.gov'},
  {id: 2, name: 'FamilySearch', type: 'access_provider', location: 'Salt Lake City, Utah, USA', website: 'https://www.familysearch.org'},
  {id: 3, name: 'Ancestry.com', type: 'access_provider', location: 'Lehi, Utah, USA', website: 'https://www.ancestry.com'},
  {id: 4, name: 'Findmypast', type: 'access_provider', location: 'London, UK', website: 'https://www.findmypast.com'},
  {id: 5, name: 'MyHeritage', type: 'access_provider', location: 'Or Yehuda, Israel', website: 'https://www.myheritage.com'},
];

// Source item templates (Evidence Explained "EE" styles)
const sourceTemplates = {
  census: {
    name: 'Census Record',
    fields: [
      {key: 'year', label: 'Census Year', type: 'text', required: true},
      {key: 'country', label: 'Country', type: 'text', required: true},
      {key: 'state', label: 'State/Province', type: 'text', required: true},
      {key: 'county', label: 'County', type: 'text', required: false},
      {key: 'city', label: 'City/Township', type: 'text', required: false},
      {key: 'enumDistrict', label: 'Enumeration District', type: 'text', required: false},
      {key: 'sheet', label: 'Sheet/Page Number', type: 'text', required: false},
      {key: 'dwelling', label: 'Dwelling Number', type: 'text', required: false},
      {key: 'family', label: 'Family Number', type: 'text', required: false},
    ]
  },
  vital: {
    name: 'Vital Record',
    fields: [
      {key: 'recordType', label: 'Record Type', type: 'select', options: ['Birth', 'Death', 'Marriage', 'Divorce'], required: true},
      {key: 'jurisdiction', label: 'Jurisdiction (County/State)', type: 'text', required: true},
      {key: 'registrationDate', label: 'Registration Date', type: 'text', required: false},
      {key: 'certificateNumber', label: 'Certificate Number', type: 'text', required: false},
      {key: 'volume', label: 'Volume', type: 'text', required: false},
      {key: 'page', label: 'Page', type: 'text', required: false},
    ]
  },
  church: {
    name: 'Church Record',
    fields: [
      {key: 'parish', label: 'Parish/Congregation', type: 'text', required: true},
      {key: 'denomination', label: 'Denomination', type: 'text', required: false},
      {key: 'location', label: 'Location', type: 'text', required: true},
      {key: 'recordType', label: 'Record Type', type: 'select', options: ['Baptism', 'Marriage', 'Burial', 'Confirmation', 'Membership'], required: true},
      {key: 'volume', label: 'Volume/Book', type: 'text', required: false},
      {key: 'page', label: 'Page', type: 'text', required: false},
      {key: 'entryNumber', label: 'Entry Number', type: 'text', required: false},
    ]
  },
  military: {
    name: 'Military Record',
    fields: [
      {key: 'branch', label: 'Military Branch', type: 'text', required: true},
      {key: 'recordType', label: 'Record Type', type: 'select', options: ['Service Record', 'Pension File', 'Draft Registration', 'Muster Roll', 'Discharge Papers'], required: true},
      {key: 'war', label: 'War/Conflict', type: 'text', required: false},
      {key: 'fileNumber', label: 'File/Pension Number', type: 'text', required: false},
      {key: 'unit', label: 'Unit/Regiment', type: 'text', required: false},
    ]
  },
  newspaper: {
    name: 'Newspaper',
    fields: [
      {key: 'paperName', label: 'Newspaper Name', type: 'text', required: true},
      {key: 'location', label: 'Publication Location', type: 'text', required: true},
      {key: 'date', label: 'Publication Date', type: 'text', required: true},
      {key: 'page', label: 'Page', type: 'text', required: false},
      {key: 'column', label: 'Column', type: 'text', required: false},
    ]
  },
  land: {
    name: 'Land Record',
    fields: [
      {key: 'county', label: 'County', type: 'text', required: true},
      {key: 'state', label: 'State', type: 'text', required: true},
      {key: 'recordType', label: 'Record Type', type: 'select', options: ['Deed', 'Grant', 'Patent', 'Survey', 'Tax Record'], required: true},
      {key: 'book', label: 'Deed Book/Volume', type: 'text', required: false},
      {key: 'page', label: 'Page', type: 'text', required: false},
      {key: 'documentDate', label: 'Document Date', type: 'text', required: false},
    ]
  },
  other: {
    name: 'Other Record',
    fields: [
      {key: 'description', label: 'Description', type: 'textarea', required: true},
    ]
  }
};