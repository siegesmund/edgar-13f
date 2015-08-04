//
// Schema for 13F index
//
var ThirteenFFiling;

ThirteenFIndex = new Mongo.Collection('data-us-13F-index');

ThirteenFFiling = new SimpleSchema({
  _id: {
    type: String
  },
  title: {
    type: String,
    label: 'The document title',
  },
  companyName: {
    type: String,
    label: 'Company Name'
  },
  cikNumber: {
    type: String,
    label: 'Central Index Key Number'
  },
  date: {
    type: Date,
    label: 'Acceptance Date & Time'
  },
  accessionNumber: {
    type: String,
    label: 'Accession Number'
  },
  type: {
    type: String,
    label: 'Type'
  },
  link: {
    type: String,
    label: 'Link to the Edgar document landing page'
  },
  links: {
    type: [String],
    label: 'XML Links',
    blackbox: true
  },
  processed: {
    type: Boolean
  },
  jsonData: {
    type: Boolean
  },
});

ThirteenFIndex.attachSchema(ThirteenFFiling);
