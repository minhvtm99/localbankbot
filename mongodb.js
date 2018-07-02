var MongoClient = require('mongodb').MongoClient;
                       
module.exports = {
  findMessage: function() {
    return MongoClient.connect("mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev").then(function(db) {
      var collection = db.collection('customers');
      
      return collection.find({'request':'findATM'}).toArray();
    }).then(function(items) {
      console.log(items);
      return items;
    });
  }
};