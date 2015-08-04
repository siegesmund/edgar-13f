if (Meteor.isServer) {
  SyncedCron.add({
    name: 'Update 13F Index',
    schedule: function(parser) {
      return parser.recur().every(5).minute().onWeekday();
    },
    job: function() {
      ThirteenF.update();
      ThirteenF.parseAndSave();
    }
  });
}
