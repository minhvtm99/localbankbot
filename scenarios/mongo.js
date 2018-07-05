'use strict';

function doConnect() {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });
}

function createCollection() {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("bankbotdev");
    dbo.createCollection("customers", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });

}


function logMessage(message) {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("bankbotdev");
    dbo.collection("customers").insertOne(message, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

}

var MongoClient = require('mongodb').MongoClient;

function findMessage(query) {
  return MongoClient.connect("mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev").then(function(db) {
    //var collection = db.collection('customers');
    var dbo = db.db("bankbotdev");
    return dbo.collection("customers").find(query).toArray();

    //return collection.find({'request':'findATM'}).toArray();
  }).then(function(items) {
    return items;
  });
}



function sortMessage(property){
  var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("bankbotdev");
  var mysort = { property: 1 };
  dbo.collection("customers").find().sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log("SORTED !");
    db.close();
  });
});
}

function deleteMessage(message){
  var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://minhvtm99:alexisozil99@ds117691.mlab.com:17691/bankbotdev";

MongoClient.connect(url, {
    useNewUrlParser: true
  }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("bankbotdev");

  dbo.collection("customers").deleteMany(message, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    db.close();
  });
});
}


module.exports.doConnect = doConnect;
module.exports.createCollection = createCollection;
module.exports.logMessage = logMessage;
module.exports.sortMessage = sortMessage;
module.exports.deleteMessage = deleteMessage;
