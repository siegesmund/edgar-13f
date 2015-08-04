if (Meteor.isServer) {
  var url = "http://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=13F&company=&dateb=&owner=include&start=0&count=100&output=atom";

  var ThirteenF = {};

  ThirteenF.getXMLLinks = function(p){
    var linkPage = HTTP.get(p.link).content;
    var $ = cheerio.load(linkPage);
    var links = $('a');

    p.links = [];

    for (i=0; i<links.length; i++){
      var link = links[i];
      var l = link.attribs.href;
      if (l.substr(l.length - 4) === '.xml'){
        if (l.indexOf('xslForm') === -1) {        // This is to screen out the human readable xslFile
          p.links.push('https://www.sec.gov' + l);
        }
      }
    }

    return p;
  };

  ThirteenF.feed = function () {
    var raw = Edgar._rss(url);
    var processed = _.map(raw, function(filing){
      var p = {};
      p.title = filing.title;
      p.date = filing.date;
      p.accessionNumber = filing.guid.split("=")[1];
      p.type = filing.categories[0];
      p.companyName = p.title.split(p.type + ' - ')[1].split(' (')[0];
      p.cikNumber = p.title.split('(')[1].split(')')[0];
      p.link = filing.link;
      p._id = p.accessionNumber;
      p.processed = false;
      p.jsonData = false;
      return p;
    });

    return processed;
  };

  ThirteenF.update = function() {
    var preExistingFilings = 0;
    var newFilings = 0;
    var filings = ThirteenF.feed();
    filings.forEach(function(filing){
      if(!ThirteenFIndex.findOne({_id:filing._id})){
        filing = ThirteenF.getXMLLinks(filing);
        ThirteenFIndex.insert(filing);
        newFilings += 1;
      } else {
        preExistingFilings += 1;
      }
    });
    var message = "ThirteenF update completed. " + newFilings + " new filings added. " + preExistingFilings + " filings were already in the index and were ignored.";
    Edgar.log("info", message);
  }

  ThirteenF.parseDocument = function(url) {
    var text = HTTP.get(url).content;
    var data = xml2js.parseStringSync(text, {tagNameProcessors: [xml2js.processors.stripPrefix]});
    return data;
  }

  // Saves document to CLOUDANT
  ThirteenF.parseAndSave = function() {
    var db = new(cradle.Connection)(process.env.CLOUDANT_URL, 443, {secure:true}).database('data-us-thirteenf-filings');
    var unprocessed = ThirteenFIndex.find({processed:false, jsonData:false});
    unprocessed.forEach(function(filing){
      var response = Async.runSync(function(done){
        data = {};
        data.data = [];
        filing.links.forEach(function(link){

          var parsedData = ThirteenF.parseDocument(link);
          if(parsedData.edgarSubmission){
            data.edgarSubmission = parsedData.edgarSubmission;
          } else {
            data.data.push(parsedData.informationTable.infoTable);
          }
        });

        db.save(filing._id, data, function(error, response){
          done(error, response);
        });
      });

      if (!response.error){
        ThirteenFIndex.update(filing, {$set:{processed:true, jsonData:true}});
      } else {
        Edgar.log('error', response.error);
      }
    })
  }

  if(Edgar) {
    Edgar.ThirteenF = ThirteenF;
  }

}
