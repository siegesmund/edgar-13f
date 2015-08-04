Package.describe({
  name: 'peter:edgar-13f',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {

  api.versionsFrom('1.1.0.3');
  api.use(['grigio:babel',
            'percolate:synced-cron',
            'aldeed:simple-schema',
            'aldeed:collection2',
            'peter:rss',
            'mrt:cheerio',
            'peerlibrary:xml2js',
            'peter:cradle',]);

  api.addFiles(['thirteenf.es6.js',
                'db.es6.js',
                'cron.es6.js'], 'server');

  api.export('ThirteenFIndex');

});
